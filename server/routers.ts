import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { advanceRoom, castVote, closeVoting, createRoom, getRoomState, joinRoom, resetRoom } from "./roomStore";

const roomCode = z.string().trim().min(4).max(8);
const hostToken = z.string().trim().min(8);
const voterToken = z.string().trim().min(8);

function withRoomError<T>(action: () => T): T {
  try {
    return action();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Não foi possível atualizar a sala.");
  }
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  rooms: router({
    create: publicProcedure.mutation(() => createRoom()),
    state: publicProcedure
      .input(z.object({ code: roomCode, voterToken: voterToken.optional() }))
      .query(({ input }) => withRoomError(() => getRoomState(input.code, input.voterToken))),
    join: publicProcedure
      .input(z.object({ code: roomCode, voterToken }))
      .mutation(({ input }) => withRoomError(() => joinRoom(input.code, input.voterToken))),
    vote: publicProcedure
      .input(z.object({ code: roomCode, optionId: z.string().min(1).max(40), voterToken }))
      .mutation(({ input }) => withRoomError(() => castVote(input.code, input.optionId, input.voterToken))),
    close: publicProcedure
      .input(z.object({ code: roomCode, hostToken }))
      .mutation(({ input }) => withRoomError(() => closeVoting(input.code, input.hostToken))),
    advance: publicProcedure
      .input(z.object({ code: roomCode, hostToken }))
      .mutation(({ input }) => withRoomError(() => advanceRoom(input.code, input.hostToken))),
    reset: publicProcedure
      .input(z.object({ code: roomCode, hostToken }))
      .mutation(({ input }) => withRoomError(() => resetRoom(input.code, input.hostToken))),
  }),
});

export type AppRouter = typeof appRouter;
