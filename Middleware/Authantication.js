const jwt = require('jsonwebtoken')

const authantication = async (req, res, next) => {


    let token = req.headers["authorization"] || req.headers["Authorization"]
console.log("........7",token);
    if (!token) return res.status(500).send("token must be present")
    token = token.split(" ")[1]
    jwt.verify(token, "Food_App", (error, decode) => {
        
        if (error) {
            
            res.status(500).send({
                success: false,
                message: "Token is invalid"
                
            })}

            req['userId']= decode['userId']
            // req['userId'] = decodedToken['userId'];
            
            next()
    })
}



const Authorization=async (req,res,next)=>{
     const id=req.query.id

     if(!id){
        return res.status(500).send({
            message:"Please provide id in params from login api",
            success:false
        })
     }

     if(req['userId']!==id){
        return res.status(500).send({
            message:"id is not match in token and params",
            success:false
        })
     }

     next()
}
module.exports = {authantication,Authorization}
