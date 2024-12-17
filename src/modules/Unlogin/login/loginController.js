const loginModel = require('./loginModel');
const loginController = {

    checkLogin: async (req, res) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ message: "Please enter both username and password." });
            }

            const response = await loginModel.checkLogin(username, password);

            if (response.length === 0) {
                return res.status(401).json({ message: "Invalid username or password." });
            }

            res.json({
                message: "Login successful",
                userName: response[0].accUserName,
                userID: response[0].userID,
                role: response[0].userType,
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
}

module.exports = loginController;