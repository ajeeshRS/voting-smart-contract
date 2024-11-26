use anchor_lang::prelude::*;

#[error_code]
pub enum VotingError {
    #[msg("Poll has already been closed")]
    PollAlreadyClosed,

    #[msg("Poll is closed")]
    PollClosed,

    #[msg("Poll has expired")]
    PollExpired,

    #[msg("Invalid option index")]
    InvalidOptionIndex,

    #[msg("Expiry time must be in the future")]
    InvalidExpiry,

    #[msg("Unauthorized access")]
    UnauthorizedAccess,

    #[msg("User has already voted")]
    AlreadyVoted,

    #[msg("Title too long")]
    TitleTooLong,

    #[msg("Description too long")]
    DescriptionTooLong,

    #[msg("Option text too long")]
    OptionTooLong,

    #[msg("Option count limit exceeds")]
    OptionCountLimitExceeds,
}
