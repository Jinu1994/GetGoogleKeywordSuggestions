const http = require('http')
const dataFilePath = "failedCategories2.json"
const failedDataFileName = "failedCategories3.json"

const businessCategories = require(`./${dataFilePath}`);

let headers = {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3VzZXJkYXRhIjoiMiIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2F1dGhlbnRpY2F0aW9uIjoiVHJ1ZSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL3VyaSI6ImRldi5hZGJveC5wcm8iLCJleHAiOjE1NjIwNjU4NjcsImlzcyI6Imh0dHA6Ly9kZXYtYXBpLm1lZGlhYnV5LnBybyJ9.nZZ851Ym6uEJUOwWf7h2p7ZlebtdjiWMjYORlJ5ZFiM',
    'Content-Type': 'application/json'
}
const fs = require('fs');

// write empty json arrays in to the file
// fs.writeFile('categories_ideas1.json', JSON.stringify([]), 'utf8', function () { })
fs.writeFile(failedDataFileName, JSON.stringify([]), 'utf8', function () { })

// Delay function
const delay = ms => new Promise(res => setTimeout(res, ms));


var categoryIdeas = []
var failedCategoriesList = []
var noOfItems = businessCategories.length;
var i = 0;
async function callNext() {

    if(i>0 && i%5==0) await delay(5000);
   
    if (i >= noOfItems) {
        return;
    }
    else {
        console.log(`fetching for ${i + 1}/${noOfItems}`)
        var responseData = "";
        let category = businessCategories[i];
        let options = {
            host: 'dev-api.mediabuy.pro',
            path: encodeURI(`/v1.0/keywords/ideas?queries=${category.name}`),
            method: 'GET',
            headers
        };
        let request = http.request(options, (resp) => {
            if (resp.statusCode != 200) {
                console.log('failed');
                failedCategoriesList.push(category);
                fs.readFile(failedDataFileName, 'utf8', function readFileCallback(err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        obj = JSON.parse(data); //now it an object
                        obj.push({
                            name: category.name,
                            parentName: category.parentName
                        }); //add some data
                        json = JSON.stringify(obj); //convert it back to json
                        fs.writeFile(failedDataFileName, json, 'utf8', function () { }); // write it back 
                    }
                });
                i++;
                callNext();
                return;
            }
            resp.on('data', function (chunk) {
                console.log('success');
                responseData += chunk;
            });
            resp.on('end', () => {
                let result = JSON.parse(responseData);
                let ideas = result.targetingIdeas;
                categoryIdeas.push({
                    name: category.name,
                    parentName: category.parentName,
                    ideas: ideas
                })

                fs.readFile('categories_ideas1.json', 'utf8', function readFileCallback(err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        obj = JSON.parse(data); //now it an object
                        obj.push({
                            name: category.name,
                            parentName: category.parentName,
                            ideas: ideas
                        }); //add some data
                        json = JSON.stringify(obj); //convert it back to json
                        fs.writeFile('categories_ideas1.json', json, 'utf8', function () { }); // write it back 
                    }
                });
                i++;
                callNext()
            })
        })
        request.on('error', (e) => {
            console.error(`Got error: ${e.message}`);
        });

        request.end();
    }
}



callNext();