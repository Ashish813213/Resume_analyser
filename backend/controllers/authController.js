const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const emailExist = await User.findOne({ email });
        if (emailExist) return res.status(400).send('Email already exists');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        const savedUser = await user.save();
        res.send({ user: { id: savedUser._id, name: savedUser.name, email: savedUser.email } });
    } catch (err) {
        res.status(400).send(err);
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).send('Email is not found');

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).send('Invalid password');

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        res.header('auth-token', token).send({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(400).send(err);
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        const resume = await require('../models/Resume').findOne({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json({ user, resume });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};
