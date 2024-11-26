// instructions/cast_vote.rs
use crate::errors::VotingError;
use crate::states::*;
use anchor_lang::prelude::*;

pub fn cast_vote(ctx: Context<CastVote>, option_index: u8) -> Result<()> {
    let poll = &mut ctx.accounts.poll;
    let vote_record = &mut ctx.accounts.vote_record;

    let (vote_record_pda, _bump) = Pubkey::find_program_address(
        &[
            VOTE_RECORD_SEED.as_bytes(),
            poll.key().as_ref(),
            ctx.accounts.voter.key.as_ref(),
        ],
        ctx.program_id,
    );

    require!(
        vote_record.voter == Pubkey::default(),
        VotingError::AlreadyVoted
    );

    require!(
        vote_record.key() == vote_record_pda,
        VotingError::AlreadyVoted
    );

    require!(!poll.is_poll_closed, VotingError::PollClosed);

    require!(
        Clock::get()?.unix_timestamp < poll.expiry,
        VotingError::PollExpired
    );
    
    require!(
        option_index < OPTIONS_COUNT as u8,
        VotingError::InvalidOptionIndex
    );

    vote_record.voter = ctx.accounts.voter.key();
    vote_record.poll = poll.key();
    vote_record.option_index = option_index;
    vote_record.bump = ctx.bumps.vote_record;

    poll.votes[option_index as usize] += 1;
    poll.total_votes += 1;
    Ok(())
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(mut)]
    pub poll: Account<'info, Poll>,

    #[account(
        init_if_needed,
        payer = voter,
        space = 8 + VoteRecord::LEN,
        seeds = [
            VOTE_RECORD_SEED.as_bytes(),
            poll.key().as_ref(),
            voter.key().as_ref()
        ],
        bump
    )]
    pub vote_record: Account<'info, VoteRecord>,

    #[account(mut)]
    pub voter: Signer<'info>,

    pub system_program: Program<'info, System>,
}
