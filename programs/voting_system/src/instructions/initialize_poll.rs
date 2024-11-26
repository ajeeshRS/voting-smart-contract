use crate::errors::VotingError;
use crate::states::*;
use anchor_lang::prelude::*;

pub fn initialize_poll(
    ctx: Context<InitializePoll>,
    title: String,
    description: String,
    options: Vec<String>,
) -> Result<()> {
    let poll = &mut ctx.accounts.poll;

    require!(
        title.as_bytes().len() <= TITLE_LENGTH,
        VotingError::TitleTooLong
    );
    require!(
        description.as_bytes().len() <= DESCRIPTION_LENGTH,
        VotingError::DescriptionTooLong
    );

    require!(
        options.len() == OPTIONS_COUNT,
        VotingError::OptionCountLimitExceeds
    );

    //copy title data
    let mut title_data = [0u8; TITLE_LENGTH];
    title_data[..title.as_bytes().len()].copy_from_slice(title.as_bytes());
    poll.title = title_data;
    poll.title_length = title.as_bytes().len() as u8;


    // Copy description data
    let mut desc_data = [0u8; DESCRIPTION_LENGTH];
    desc_data[..description.as_bytes().len()].copy_from_slice(description.as_bytes());
    poll.description = desc_data;
    poll.description_length = description.as_bytes().len() as u8;


    // Copy options data
    let mut options_data = [[0u8; OPTION_LENGTH]; OPTIONS_COUNT];
    let mut option_lengths = [0u8; OPTIONS_COUNT];

    for (i, option) in options.iter().enumerate() {
        require!(
            option.as_bytes().len() <= OPTION_LENGTH,
            VotingError::OptionTooLong
        );
        options_data[i][..option.as_bytes().len()].copy_from_slice(option.as_bytes());
        option_lengths[i] = option.as_bytes().len() as u8;
    }

    poll.options = options_data;
    poll.option_lengths = option_lengths;
    poll.votes = [0; OPTIONS_COUNT];
    poll.total_votes = 0;
    poll.authority = ctx.accounts.authority.key();
    poll.is_poll_closed = false;
    poll.expiry = Clock::get()?.unix_timestamp + 86400; //24 hrs from now
    poll.bump = ctx.bumps.poll;

    Ok(())
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct InitializePoll<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Poll::LEN,
        seeds = [
            title.as_bytes(),
            POLL_SEED.as_bytes(),
            authority.key().as_ref()
        ],
        bump
    )]
    pub poll: Account<'info, Poll>,

    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}
