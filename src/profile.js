const express = require('express');
const auth = require('../middleware/auth');
const Profile = require('../models/profile');
const User = require('../models/user');
const router = express.Router();

router.get('/me', auth, async (req, res) => {
    try {
        // populate method is used to extract data from other model.
        const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar']);
        console.log(profile);
        if(!profile){
            return res.status(400).json({msg: "There is no profile for this user"});
        }
        res.send(profile);
    } catch (err) {
        res.status(500).send('Server Error');
    }
})

module.exports = router;