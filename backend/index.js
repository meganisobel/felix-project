const mockEnergyCost = require('./mock-energy-cost.json')
const mockEnergyType = require('./mock-energy-type.json')
const rice = require('./mock-rice.json')

const express = require('express');

const app = express();

const transformEnergyToPrice = (methodOfCooking) => {
    let totalPrice = 0
    for (const item of methodOfCooking) {
        const { cookingMode, duration } = item
        const { energyType, kilowattsPerHour } = mockEnergyType.energyTypes.find(type => type.appliance === cookingMode)
        const { priceOfKilowattsPerHour } = mockEnergyCost.energyTypes.find(type => type.type === energyType)
        const itemEnergyCost = duration * priceOfKilowattsPerHour * kilowattsPerHour
        totalPrice += itemEnergyCost
    }
    return totalPrice
}

const calculateIngredientsPrice = (ingredients) => {
    return ingredients.reduce( (runningTotal, current) => {
        return runningTotal + current.price
        },
        0
    )
}

const calculateNutritionalScore = (nutritionalInformationPer100Grams) => {
    const guidelinesInGrams = {
        sugars: {
            high: 22.5,
            low: 5
        },
        salt: {
            high: 1.5,
            low: 0.3
        },
        saturatedFat: {
            high: 17.5,
            low: 3
        }
    }

    const scoring = {
        high: 2,
        medium: 1,
        low: 1
    }

    let cumulativeScore = 0

    nutritionalInformationPer100Grams.map(nutrient => {
        const { nutrientType, nutrientGramsPer100Grams } = nutrient
        if (nutrientGramsPer100Grams >= guidelinesInGrams[nutrientType].high) {
            cumulativeScore += scoring.high
        } else if (nutrientGramsPer100Grams >= guidelinesInGrams[nutrientType].low) {
            cumulativeScore += scoring.low
        } else {
            cumulativeScore += scoring.medium
    }}
    )
    return cumulativeScore
}


const calculateScore = (recipe) => {
    const energyPrice = transformEnergyToPrice(recipe?.methodOfCooking)
    const ingredientsPrice = calculateIngredientsPrice(recipe?.ingredients)
    const nutritionalScore = calculateNutritionalScore(recipe?.nutritionalInformation)
    const totalScore = (energyPrice + ingredientsPrice) * nutritionalScore
    return {
        energyPrice,
        ingredientsPrice,
        nutritionalScore,
        totalScore
    }
}


app.get('/recipe', (req, res) => {
    let ingredient = req.query.ingredient;
    //TODO - this wouldn't be stubbed
    if (ingredient === "rice") {
        const recipeScores = rice.recipes.map(recipe => {
            return {
                score: calculateScore(recipe),
                recipe: recipe.label
            }
            })
        res.json(recipeScores)
    }
  res.send(`No recipes found for ${ingredient}`);
});

app.listen(3000, () => console.log('Example app is listening on port 3000.'));
