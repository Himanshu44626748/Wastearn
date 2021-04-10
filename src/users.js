const express = require('express');
const {check, validationResult} = require('express-validator');
const User = require('../models/user');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

//For registering user
router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Minimum length should be 5').isLength({min: 5})
], 
async (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors})
    }

    const { name, email, password, pincode, city, address} = req.body;

    try {
        //see if user exists
        let user = await User.findOne({email})

        if(user){
            return res.status(400).json({ errors: [{ msg: "User already exists"}] });
        }

        //get users gravatar(lind of profile photo)
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })

        user = new User({
            name,
            email,
            avatar,
            password,
            pincode,
            city,
            address
        })

        //encrypt password
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        await user.save();              //to save the user into the database

        // return jwt
        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, 'jwtsecret', 
        {  expiresIn: 360000 },
        (err, token) => {
            if(err)
            throw err;
            
            res.json({ token })
        }
        )

        // res.send("Users Registered");
    } catch (err) {
        console.log(err);
        res.status(500).send('Server error')
    }
})

module.exports = router;