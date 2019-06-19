
const businessCategories1 = require("./categories_ideas.json");
const businessCategories2 = require("./categories_ideas1.json");


businessCategories2.forEach(element => {
    var categoryToUpdate = businessCategories1.find(c=>c.name==element.name);
    categoryToUpdate.ideas = element.ideas;
});