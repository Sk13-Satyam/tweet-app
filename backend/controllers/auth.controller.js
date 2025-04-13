export const signup = async (req, res) => {
    res.json({
        data: "User signed up successfully",         
})
}

export const login = async (req, res) => {
    res.json({
        data: "User logged in successfully",         
})
}   

export const logout = async (req, res) => {     
    res.json({
        data: "User logged out successfully",         
})
}