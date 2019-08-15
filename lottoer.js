const fetch = require('node-fetch');
const OLDEST_YEAR_DOCUMENTED = 1985;

/**
 * Simple nodeJS script that returns all lotto (Íslensk Getspá) sequences that have appeared more than once since 1986.
 */
(function init() {
    let lottourl = "https://games.lotto.is/game/lotto-aggregated-results?productId=1&productId=1&year="
    let start_year = new Date().getFullYear();
    const promises = [];

    // Loop over all years from current year back until last year that lotto numbers were documented
    // Create a promise for each and store in the promises array.
    for (var i = parseInt(start_year); i > OLDEST_YEAR_DOCUMENTED; i--) {
        promises.push(new Promise((resolve, reject) => {
            fetch(lottourl+(""+i)).then(res => res.json()).then(json => {
                const data = JSON.parse(JSON.stringify(json));
                
                // Reject empty results
                if (data.results.length === 0) {
                    reject(data);
                }
                const numbers = data.results.map(result => result.result.lottoNumbers);
                resolve(numbers);
            });
        }));
    }

    // Resolve all the promises and evoke count_sequence when done.
    Promise.all(promises).then(values => {
        const numbers = [];
        values.map(value => {
            value.map(val => {
                numbers.push(val);
            })
        });
        const map = count_sequences(numbers);
        display_results(occured_more_than_once(map));
    });

    /**
     * Returns a map of sequence as key and occurance count as value
     */
    function count_sequences(sequences) {
        return sequences.reduce((acc, curr) => {
            const sorted = curr.sort();
            if (acc[sorted]) {
                acc[sorted]++
            } else {
                acc[sorted] = 1;
            }
            return acc;
        },{});
    }

    /**
     * Returns an array of those sequences that have occured more than once
     */
    function occured_more_than_once(map) {
        const ret = []
        Object.keys(map).map(key => {
            if (map[key] > 1) {
                ret.push(key)
            }
        });
        return ret;
    }

    /**
     * Displays the results to the console
     */
    function display_results(results) {
        console.log("The following sequences of lotto numbers have occured more than once since " + parseInt(OLDEST_YEAR_DOCUMENTED+1));
        console.log(results);
    } 

})();



