pub mod errors;
pub mod instructions;
pub mod states;

use crate::instructions::*;
use anchor_lang::prelude::*;

declare_id!("HcPzBYe1hHF6eNzsr2abxjFfRWD5QfZa4J9UCZjNyy64");

#[program]
pub mod voting_system {
    use super::*;

    pub fn initialize_poll(
        ctx: Context<InitializePoll>,
        title: String,
        description: String,
        options: Vec<String>,
    ) -> Result<()> {
        instructions::initialize_poll::initialize_poll(ctx, title, description, options)
    }

    pub fn cast_vote(
        ctx: Context<CastVote>,
        option_index: u8
    ) -> Result<()> {
        instructions::cast_vote::cast_vote(ctx, option_index)
    }

    pub fn close_poll(ctx: Context<ClosePoll>) -> Result<()> {
        instructions::close_poll::close_poll(ctx)
    }
}
