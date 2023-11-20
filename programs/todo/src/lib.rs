use anchor_lang::prelude::*;

declare_id!("HhaBvvmMtHPU62mLhAJxWmmwGtN5aqCm5oeJbnRHER43");

#[program]
pub mod todo {
    use super::*;

    pub fn create(ctx: Context<Create>, input: String) -> Result<()> {
        msg!("Create task: `{}` by {}", input, ctx.accounts.user.key());
        ctx.accounts.task.message = input.clone();
        ctx.accounts.task.user = ctx.accounts.user.key();

        emit!(CreateTask {
            task: ctx.accounts.task.key(),
            user: ctx.accounts.user.key(),
            message: input,
        });
        Ok(())
    }

    pub fn update(ctx: Context<Update>, input: String) -> Result<()> {
        msg!("Update task: `{}` by {}", input, ctx.accounts.user.key());
        ctx.accounts.task.message = input.clone();

        emit!(UpdateTask {
            task: ctx.accounts.task.key(),
            user: ctx.accounts.user.key(),
            message: input,
        });
        Ok(())
    }

    pub fn delete(ctx: Context<Delete>) -> Result<()> {
        msg!("Delete task: {} by {}", ctx.accounts.task.key(), ctx.accounts.user.key());

        emit!(DeleteTask {
            task: ctx.accounts.task.key(),
            user: ctx.accounts.user.key(),
        });
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(input: String)]
pub struct Create<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        init, 
        payer = user, 
        space = Task::calculate(&input),
    )]
    pub task: Account<'info, Task>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(input: String)]
pub struct Update<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        realloc = Task::calculate(&input),
        realloc::payer = user,
        realloc::zero = false,
        has_one = user,
    )]
    pub task: Account<'info, Task>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Delete<'info> {
    pub user: Signer<'info>,
    #[account(
        mut,
        close = user,
        has_one = user,
    )]
    pub task: Account<'info, Task>,
}


#[account]
pub struct Task {
    user: Pubkey, // 32 bytes
    message: String, // 4 bytes + String length
}

impl Task {
    const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;
    const PUBKEY_SIZE: usize = 32;
    const STRING_LENGTH_SIZE: usize = 4;
    const TASK_ACCOUNT_SIZE: usize = Self::ANCHOR_DISCRIMINATOR_SIZE + Self::PUBKEY_SIZE + Self::STRING_LENGTH_SIZE;  

    pub fn calculate(input: &str) -> usize {
        Self::TASK_ACCOUNT_SIZE + input.len()
    }
}

#[event]
pub struct CreateTask {
    pub task: Pubkey,
    pub user: Pubkey,
    pub message: String,
}

#[event]
pub struct UpdateTask {
    pub task: Pubkey,
    pub user: Pubkey,
    pub message: String,
}


#[event]
pub struct DeleteTask {
    pub task: Pubkey,
    pub user: Pubkey,
}