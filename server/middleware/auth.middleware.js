import jwt from 'jsonwebtoken'
import User from '../model/user.model.js'

export const protectRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        if(!accessToken) return res.status(401).json({message: "unauthorized - no acces token provide"})

       try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN)
        const user = await User.findById(decoded.userId).select("-password")
        if(!user) return res.status(401).json({message: "user not found"})
        
        req.user = user    
        next()    
       } catch(err) {
          if(err.name === "TokenExpiredError") {
            res.status(401).json({message: "unauthorized - access token has been expired"})
          }
          throw err
       }

    } catch (err) {
        console.log("error in protected route", err.message)
      res.status(500).json({message: "server error", error: err.message})
    }
}

export const adminRoute = async (req, res, next) => {
    if(req.user && req.user.role !== "admin") return res.status(403).json({message: "access denied -- admin only"})

    next()    
}