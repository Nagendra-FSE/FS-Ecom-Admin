import User from '../model/user.model.js'
import jwt from 'jsonwebtoken'
import { redis } from '../lib/redis.js'

import dotenv from "dotenv";
dotenv.config();  

const generateTokens = (userId) => {
  const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN, {
    expiresIn: "15m"
  })

  const refreshToken = jwt.sign({userId}, process.env.REFRESH_TOKEN, {
    expiresIn: "7d"
  })

  return {accessToken, refreshToken}
}

const storeRefreshToken = async (userId, refresh_token) => {
    await redis.set(`refresh_token:${userId}`, refresh_token, "EX", 7*24*60*60);
}

const setCookie = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
    httpOnly: true, // prevent xss
    secure: process.env.NODE_ENV === "production",
    sameSite: "None", // prevent csrf
    maxAge: 15 * 60 * 1000, //15 min
   })
   res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // prevent xss attacks
    secure: process.env.NODE_ENV === "production",
    sameSite: "None", // prevent csrf attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
   })
}

export const signup = async (req, res) => {
    try {
        const userData = req.body;
        const {email} = userData
        const userExists = await User.findOne({email});
        if(userExists) return res.status(400).json({message: "user already exists" })
        const user = await User.create({...userData})
        const { accessToken, refreshToken } = generateTokens(user._id);
        storeRefreshToken(user._id, refreshToken);
        setCookie(res, accessToken, refreshToken)
        res.status(201).json({user: user.name, message: "user has been created" }) 
    } catch(err) {
        res.status(400).json({message: err.message })
    }
    
}

export const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if(!user) return res.status(404).json({message: "Email is incorrect, please signup" })
        const validUser = await user.comparePassword(password)
        if(!validUser) return res.status(403).json({message: "Password is incorrect" })
        const { accessToken, refreshToken } = generateTokens(user._id);
        storeRefreshToken(user._id, refreshToken);
        setCookie(res, accessToken, refreshToken)
        res.json(
            {
                user: 
            {
             _id: user._id,
             name: user.name,
             email: user.email,
             role: user.role
            }, 
            message: "logged in sucess" 
        }) 
    } catch(err) {
        res.status(400).json({message: err.message })
    }
}   

export const logout = async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken
       if(refreshToken){
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN)
        await redis.del(`refresh_token:${decoded.userId}`)
       }
       res.clearCookie("refreshToken")
       res.clearCookie("accessToken")
       res.json({message: "user logged off successfully"})

    } catch(err) {
        res.status(500).json({message: err.message  })
    }
}

export const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) return res.status(404).json({message: "refresh token not found" })
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN)
        const redisRefreshToken =  await redis.get(`refresh_token:${decoded.userId}`)
        if(refreshToken !== redisRefreshToken) return res.status(401).json({message: "invalid refresh token" })
        const accessToken = jwt.sign({userId: decoded.userId}, process.env.ACCESS_TOKEN, {
                expiresIn: "15m"
              })
        res.cookie("accessToken", accessToken, {
            httpOnly: true, // prevent xss
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict", // prevent csrf
            maxAge: 15 * 60 * 1000, //15 min
           })
           res.status(201).json({message: "refresh token stored" })
    } catch(err) {
        res.status(500).json({message: err.message })
    }
}  

export const getProfile = async (req, res) => {
    try {
        const user = req.user
        const profile = await User.findOne(user).select("-password")
        if(!profile) return res.status(404).json({message: "user not found" })
        res.status(200).json({profile})
    } catch(err) {
        res.status(500).json({message: err.message })
    }
}