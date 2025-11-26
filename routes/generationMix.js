const express = require('express')
const router = express.Router();
const axios = require('axios')

router.get('/', function (req, res) {
    res.send('health check ok')
})
router.get('/dailyFuelsPercentage', function (req, res) {
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 2)
    const isoString1 = startDate.toISOString()
    const isoString2 = endDate.toISOString()
    console.log(isoString1)
    console.log(isoString2)

    axios
        .get(`https://api.carbonintensity.org.uk/generation/${isoString1}/${isoString2}`)
        .then((response) => {

            const data = response.data['data']
            const dailyAverages=grouping(data)
    
            res.json(dailyAverages)
        })
        .catch((error) => {
            console.log(error)
        })
})

function grouping(data) {

    const groupedByDate = {}
    for (const period of data) {
        const day = period.from.slice(0, 10)
        if (!groupedByDate[day]) {
            groupedByDate[day] = []
        }
        groupedByDate[day].push(period)
    }
    const dailyAverages = {};
    //console.log(groupedByDate)

    for (const day in groupedByDate) {
        const periods = groupedByDate[day];
        //console.log(periods)
        const fuelSums = {};
        const fuelCounts = {};
        for (const period of periods) {
            for (const fuelInfo of period.generationmix) {
                const fuel = fuelInfo.fuel
                const percentage = fuelInfo.perc
                if (!fuelSums[fuel]) {
                    fuelSums[fuel] = 0
                    fuelCounts[fuel] = 0
                }
                fuelSums[fuel] += percentage
                fuelCounts[fuel] += 1
            }
        }
        const avg = {}
        for (const fuel in fuelSums) {
            avg[fuel] = (fuelSums[fuel] / fuelCounts[fuel]).toFixed(3)
        }
        dailyAverages[day] = avg
    }
    //console.log(dailyAverages)

    for (const day in dailyAverages) {
        const fuels = dailyAverages[day]
        const cleanFuels = ['biomass', 'hydro', 'solar', 'wind', 'nuclear']
        let cleanEnergySum = 0
        for (const fuel of cleanFuels) {
            cleanEnergySum += parseFloat(fuels[fuel])

        }
        fuels['cleanEnergyPerc'] = cleanEnergySum.toFixed(3)
    }
    return dailyAverages

}

router.get('/optimalWindow/:hours', function (req, res) {
    const windowHours = parseInt(req.params.hours);
    if (!windowHours || windowHours < 1 || windowHours > 6) {
        return res.status(400).json({ error: 'Hours must be between 1 and 6' });
    }
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 2)
    const isoString1 = startDate.toISOString()
    const isoString2 = endDate.toISOString()
    console.log(isoString1)
    console.log(isoString2)

    axios
        .get(`https://api.carbonintensity.org.uk/generation/${isoString1}/${isoString2}`)
        .then((response) => {

            const data = response.data['data']
            
            const cleanFuels= ['biomass', 'hydro', 'solar', 'wind', 'nuclear']
            const cleanEnergyPeriods=[]
            for(let i=0;i<data.length;i++){
                let cleanEnergyPerc=0
                for(let j=0;j<data[i].generationmix.length;j++){
                    const fuel=data[i].generationmix[j].fuel
                    const perc=data[i].generationmix[j].perc
                    if(cleanFuels.includes(fuel)){
                        cleanEnergyPerc+=perc
                    }

                }
                cleanEnergyPeriods.push({
                    from:data[i].from,
                    to:data[i].to,
                    cleanEnergyPerc: cleanEnergyPerc
                })
            }
          
            let bestWindow = null
            let bestAvg = 0
            const windowSize = windowHours * 2 // liczba półgodzinnych okresów

            for (let i = 0; i <= cleanEnergyPeriods.length - windowSize; i++) {
                let sum = 0
                for (let j = 0; j < windowSize; j++) {
                    sum += cleanEnergyPeriods[i + j].cleanEnergyPerc
                }
                const avg = sum / windowSize
                if (avg > bestAvg) {
                    bestAvg = avg
                    bestWindow = {
                        from: cleanEnergyPeriods[i].from,
                        to: cleanEnergyPeriods[i + windowSize - 1].to,
                        avgCleanEnergyPercentage: avg.toFixed(2)
                    }
                }
            }


            //console.log(cleanEnergyPeriods)
    
            res.json(bestWindow)
            console.log(bestWindow)
        })
        .catch((error) => {
            console.log(error)
        })
    

       
})




module.exports = router; 
