const mongoose = require('mongoose')
require('dotenv').config()
const { performance } = require("perf_hooks");
const Pokemon = require('../models/Pokemon')



async function main() {
    const start = performance.now();
    console.log('start')
    
    let dbConnection
    try {
        dbConnection = await mongoose.connect(process.env.MONGO_URI)
        console.log('DB Connected')
    } catch (error) {
        console.log('error connecting to database', error)
    }

    await Pokemon.deleteMany()
    await getPokemon()


    
    // await dbConnection close connection
    console.log('end')
    const end = performance.now();
    console.log(`time taken: ${end - start}ms`);
    process.exit(0)
}
async function getPokemon() {
    let url = 'https://pokeapi.co/api/v2/pokemon?limit=50'
    let next = null
    while (url) {
    const pokemonUrls = []
    const response = await fetch(url)
    const data = await response.json()

    data.results.forEach(pokemon => {
        // save the pokemon
        pokemonUrls.push(pokemon.url)
    })

    for (const pokemonUrl of pokemonUrls) {
        await processPokemon(pokemonUrl)
    }

    url = data.next
    console.log(url)
    }
}

async function processPokemon(url) {
    try {
        const response = await fetch(url)
        const data = await response.json()
    
        const pokemon = {
            pokemonId: data.id,
            name: data.name,
            image: data.sprites.front_default,
            height: data.height,
            weight: data.weight
        }
    
        await new Pokemon(pokemon).save()
    } catch (error) {
        console.log('error processing pokemon', error)
    }
}

main()