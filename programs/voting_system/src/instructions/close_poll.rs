// instructions/close_poll.rs
use anchor_lang::prelude::*;
use crate::errors::VotingError;
use crate::states::*;

pub fn close_poll(ctx: Context<ClosePoll>) -> Result<()> {
    let poll = &mut ctx.accounts.poll;
    
    require!(
        poll.authority == ctx.accounts.authority.key(),
        VotingError::UnauthorizedAccess
    );

    

    require!(!poll.is_poll_closed, VotingError::PollAlreadyClosed);

    poll.is_poll_closed = true;

    // Optional: Return the rent to the authority if you want to close the account
    // If you want this behavior, uncomment the following line and add receiver to struct
    // let dest_starting_lamports = ctx.accounts.authority.lamports();
    // **ctx.accounts.authority.lamports.borrow_mut() = dest_starting_lamports
    //     .checked_add(ctx.accounts.poll.to_account_info().lamports())
    //     .unwrap();
    // **ctx.accounts.poll.to_account_info().lamports.borrow_mut() = 0;
    
    Ok(())
}

#[derive(Accounts)]
pub struct ClosePoll<'info> {
    #[account(
        mut,
        seeds = [
            poll.title[..poll.title_length as usize].as_ref(),
            POLL_SEED.as_bytes(),
            authority.key().as_ref()
        ],
        bump = poll.bump,
        // constraint = poll.authority == authority.key() @ VotingError::UnauthorizedAccess,
        // constraint = !poll.is_poll_closed @ VotingError::PollAlreadyClosed,
    )]
    pub poll: Account<'info, Poll>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}