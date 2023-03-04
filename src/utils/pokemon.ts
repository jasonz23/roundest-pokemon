const MAX_DEX_ID = 5;
export const getRandomPokemon = (notThisOne: number = 0 ): number => {
    let pokedexNumber = 0;
    do {
        pokedexNumber = Math.floor(Math.random() * (MAX_DEX_ID - 1) + 1);
    } while (pokedexNumber === notThisOne);

    return pokedexNumber;
}

export const getOptionsForVote = (): number[] => {
    const firstID = getRandomPokemon();
    const secondID = getRandomPokemon(firstID);

    return [firstID, secondID];
}