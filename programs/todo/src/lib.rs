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
        space = 8 + 32 + 4 + input.len(),
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
        realloc = 8 + 32 + 4 + input.len(),
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
    user: Pubkey,
    message: String, 
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