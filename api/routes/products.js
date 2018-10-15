const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Product = require('../models/product');

router.get('/', (req, res, next) => {
    // res.status(200).json({
    //     message:'Handling GET request to /products'
    // });

    Product.find()
        .select('name price _id') // i only want to get these field from database
        .exec()
        .then(docs => {
            console.log(docs);

            const response = {
                count:docs.length,
                products:docs.map(doc =>{
                    return {
                        name:doc.name,
                        price:doc.price,
                        _id:doc._id,
                        request:{
                            type:'GET',
                            url:'http://localhost:3000/products/'+doc._id
                        }
                    }
                })

            };

            res.status(200).json(response); //done to tailor my respnse
           // if (docs.length > 0) {   //done because the databse returns "empty array" when there is no data  
             //   res.status(200).json(docs);// <--- this used to be untailored response. 
            // } else {
            //     res.status(404).json({
            //         message: "No entries found"
            //     });
            // }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});


router.post('/', (req, res, next) => {

    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });
    product.save().then(result => {
        console.log(result);
        res.status(201).json({
            message: "Created product successfully",
            createdProduct: {
                name:result.name,
                price:result.price,
                _id:result._id,
                request:{
                    type:'GET',
                    url:"http://localhost:3000/products/"+result._id
                }

            }
        });
    })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        }
        );


});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .exec()
        .then(doc => {
            console.log("From datase", doc);
            if (doc) { //if there is valid "_id" but no data then database returns "null"
                res.status(200).json({
                    product:doc,
                    request:{
                        type:'GET',
                        url:'http://localhost:3000/products'
                    }
                });
            } else {
                res.status(404).json({ message: "No valid entry found for provided ID" });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });


    // if(id === 'special'){
    //     res.status(200).json({
    //         message:'You discovered the special ID',
    //         id:id
    //     });
    // }else{
    //     res.status(200).json({
    //         message:'You passed an ID'
    //     });
    // }
});

router.patch('/:productId', (req, res, next) => {
    // res.status(200).json({
    //     message: 'updated product'
    // });
    // pass the data as:
    //[
    //  {"propName":"name","value":"HarryPotter 5"}
    //]
    //
    //
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Product.update({_id:id},{$set:updateOps}) //could have hardcoded as {$set:{name:req.body.Newname,price:req.body.newPrice}}
    .exec()
    .then(result =>{
        console.log(result);
        res.status(200).json({
            message:"Product updated",
            request:{
                type:'GET',
                url:'http://localhost:3000/products/'+id
            }
        });
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error:err
        });
    });
});


router.delete('/:productId', (req, res, next) => {
    // res.status(200).json({
    //     message:'Deleted product'
    // });
    const id = req.params.productId;
    Product.remove({
        _id: id
    }).exec()
        .then(result => {
            res.status(200).json({
                message:'Product deleted',
                request:{
                    type:'POST',
                    url:'http://localhost:3000/products',
                    body:{name:'String',price:'Number'}
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });

});

module.exports = router;