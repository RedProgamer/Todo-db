const express = require('express');
const parser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

// Establishing Mongodb Connection
mongoose.connect('mongodb+srv://nirmal:omsukhari@cluster0.jjx5b.mongodb.net/simple');

// Schema
const todosSchema = mongoose.Schema({
    name: String
});

const customListSchema = mongoose.Schema({
    name: String,
    todos: [todosSchema]
});

const itemsModel = mongoose.model('todo', todosSchema);

// Custom Model
const customListModel = mongoose.model('custom', customListSchema);

app.set('view engine', 'ejs');
app.use(parser.urlencoded({extended:true}));
app.use(express.static("public"));

app.get('/', (req, res) => {

    //Get the items
    itemsModel.find({}, function(err, result) {
        if(!err) {
            res.render('list', {listTitle: 'Today', newItem: result});
        }else {
            console.error(err);
        }
    });
});

app.post('/', (req, res) => {
    
    const task = req.body.task;
    const listName = req.body.list;

    if(listName === 'Today') {
        itemsModel.create({name: task}, function(err, done) {
            if(!err) {
                console.log('Added to List item');
            }else {
                console.error(err);
            }
        });
        res.redirect("/");
    }else {
        customListModel.findOne({name: listName}, function(err, result) {
            if(!err) {
                result.todos.push({name: task});
                result.save();
                res.redirect("/" + listName);
            }else {
                console.error(err);
            }    
        });
    }
});

app.post('/delete', (req, res) => {
    const item_id = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === 'Today') {
        itemsModel.deleteOne({_id: item_id}, function(err, result) {
            if(!err) {
                console.log('Deleted from collection');
            }else {
                console.error(error);
            }
        });
        res.redirect('/');
    }else {
        customListModel.findOneAndUpdate({name: listName}, {$pull: {todos: {_id: item_id}}}, function(err, result) {
            if(!err) {
                res.redirect("/" + listName);
            }else {
                console.error(err);
            }
        });
    }
});

app.get('/:postName', (req, res) => {
    const paramName = _.capitalize(req.params.postName);

    customListModel.findOne({ name: paramName }, function(err, result) {
        if(!err) {
            if(!result) {
                //Create a new lists
                customListModel.create({
                    name: paramName,
                    todos: [] 
                });
                res.redirect("/" + paramName);
            }else {
                // Show the existing list
                res.render('list', {listTitle: result.name, newItem: result.todos});
            }
        }
    });
});

app.listen(process.env.PORT || 8000, ()=>{
    console.log('http://localhost:8000');
});
