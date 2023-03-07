import { z } from 'zod';
import { procedure, router } from '../trpc';
import { PokemonClient } from 'pokenode-ts';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const appRouter = router({
  getPokemonByID: procedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const api = new PokemonClient();

      const pokemon = await api.getPokemonById(input.id);

      return {
        pokemon: {
          id: input.id,
          name: pokemon.name,
          sprites: pokemon.sprites,
          stats: pokemon.stats
        }
      };
    }),
  signIn: procedure
  .input(
    z.object({
      userName: z.string(),
      password: z.string()
    })
  )
  .mutation(async ({input}) => {
    const userExists = await prisma.user.findMany({
      where: {userName: input.userName}
    }).then(r => r.length == 0)
    if (userExists) {
      return {response: {success: false, error: "User does not Exist", data: {}}}
    }
    const users = await prisma.user.findFirst(
      {where: {
        userName: input.userName,
        password: input.password
    }}
    )
    if (users === null)
    {
      return {response: {success: false, data: users, error:"Wrong User Name or Password"}};
    }
    return {response: {success: true, data: users, error:""}};
  }),
  signUp: procedure
  .input(
    z.object({
      userName: z.string(),
      password: z.string()
    })
  )
  .mutation(async ({input}) => {
    const userExists = await prisma.user.findMany({
      where: {userName: input.userName}
    }).then(r => r.length > 0)
    if (userExists) {
      return {response: {success: false, error: "User Already Exists", data: {}}}
    }
    await prisma.user.create({
      data : {
        userName: input.userName,
        password: input.password,
        highestScore: 0
      }
    });
    return {response: {success: true, data: {userName: input.userName, password: input.password, highestScore: 0}}}

  }),
  updateHighestScore: procedure
    .input(
      z.object({
        userName: z.string(),
        highestScore: z.number()
      })
    )
    .mutation(async ({input}) => {
      const user = await prisma.user.updateMany({
        where: {
          userName: input.userName
        },
        data: {
          highestScore: input.highestScore
        }
      })
      return {response: {success: true, data: user, error:""}}
    })
});
// export type definition of API
export type AppRouter = typeof appRouter;