const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const date = require(__dirname + '/date.js');
const mongoose = require('mongoose');
var _ = require('lodash');
const ObjectId = require('mongodb').ObjectId
var PORT = process.env.PORT;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

var date_now = date.dateNow();
var mongoAtlasURL = process.env.AtlasDbUrl;

mongoose.connect(mongoAtlasURL, () => {
    console.log('Database status : Connected');
});


const itemsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

const listsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    items: {
        type: Array,
    }
})


const Item = mongoose.model('todoitem', itemsSchema);
const List = new mongoose.model('list', listsSchema);



app.get('/', (req, res) => {

    List.findOne({ name: 'List' }, (err, result) => {
        if (!result) {
            const newList = new List({
                name: "List",
                items: []
            });
            newList.save().then(() => res.redirect('/List'));
        } else {
            // console.log('found' + result);
            res.render('list', { ListTitle: result.name, todoItems: result.items });
        }
    })

})


app.post('/', (req, res) => {
    const listName = req.body.listName;
    const newTodo = req.body.newTodo.substring(0,35);
 
    var newItem = new Item({
        name: newTodo
    });

    List.findOne({ name: listName }, (err, foundList) => {
        if (!err) {
            foundList.items.push(newItem);
            foundList.save();
            res.redirect('/' + listName);
        }
    })
})


app.post('/delete', (req, res) => {

    const item_id_to_Delete = (req.body.checkbox).trim();
    const list_name = req.body.ListName;

    // console.log(list_name);
    // console.log(item_id_to_Delete);

    List.updateOne({ name: list_name }, { "$pull": { "items": { "_id": ObjectId(item_id_to_Delete) } } }, { safe: true, multi: true }, (err, obj) => {
        if (!err) {
            // console.log(obj);
        }
    });
    res.redirect(`/${list_name}`);

})




app.get('/:listName', (req, res) => {
    const newList = _.capitalize(req.params.listName);

    List.findOne({ name: newList }, (err, foundList) => {
        if (!err) {
            if (!foundList) {
                // Creates a new list
                const item = new List({
                    name: newList,
                    items: []
                });
                item.save().then(() => res.redirect('/' + newList));
            } else {
                // Show Items of an Existing List
                res.render('list', { ListTitle: foundList.name, todoItems: foundList.items })

            }
        } else {
            console.log(err);
        }

    })


})

app.listen(PORT, () => {
    console.log("Server status : Running on "+ PORT);
})





