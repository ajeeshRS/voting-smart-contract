use anchor_lang::prelude::*;

pub const TITLE_LENGTH: usize = 32;
pub const DESCRIPTION_LENGTH: usize = 500;
pub const OPTION_LENGTH: usize = 32;
pub const OPTIONS_COUNT: usize = 4;

pub const POLL_SEED: &str = "POLL_SEED";
pub const VOTE_RECORD_SEED: &str = "VOTE_SEED";

#[account]
pub struct Poll {
    pub authority: Pubkey,
    pub title: [u8; TITLE_LENGTH],
    pub title_length: u8,
    pub description: [u8; DESCRIPTION_LENGTH],
    pub description_length: u8,
    pub options: [[u8; OPTION_LENGTH]; OPTIONS_COUNT],
    pub option_lengths: [u8; OPTIONS_COUNT],
    pub votes: [u64; OPTIONS_COUNT],
    pub total_votes: u64,
    pub expiry: i64,
    pub is_poll_closed: bool,
    pub bump: u8,
}

impl Poll {
    pub const LEN: usize = 32 + // authority
        TITLE_LENGTH + // title
        1 + // title_length
        DESCRIPTION_LENGTH + // description
        1 + // description_length
        (OPTION_LENGTH * OPTIONS_COUNT) + // options
        OPTIONS_COUNT + // option_lengths
        (8 * OPTIONS_COUNT) + // votes
        8 + // total_votes
        8 + // expiry
        1 + // is_poll_closed
        1; // bump
}

#[account]
pub struct VoteRecord {
    pub voter: Pubkey,
    pub poll: Pubkey,
    pub option_index: u8,
    pub bump: u8,
}

impl VoteRecord {
    pub const LEN: usize = 32 + // voter
        32 + // poll
        1 + // option_index
        1; // bump
}
