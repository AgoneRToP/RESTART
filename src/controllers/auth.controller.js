import { User } from "../models/user.model.js";



class AuthController {
  #_userModel;
  constructor() {
    this.#_userModel = User;
  }

  register = async (req, res, next) => {
    const { name, age, email, password } = req.body;

    const existing = await this.#_userModel.findOne({ email });

    if (existing) {
      return res.status(409).send({
        success: false,
        message: `Given email: ${email} already in use`,
      });
    }

    const hashedPassword = await this.#_hashPassword(password);

    const user = await this.#_userModel.insertOne({
      name,
      age,
      email,
      password: hashedPassword,
    });

    const accessToken = this.#_generateAccessToken({ id: user._id })
    const refreshToken = this.#_generateRefreshToken({ id: user._id })

    res.send({
        success: true,
        data: {
            accessToken,
            refreshToken,
            userId: user._id,
        }
    })
  };

  login = async (req, res, next) => {
    const { email, password } = req.body;

    const existing = await this.#_userModel.findOne({ email });

    if (!existing) {
      return res.status(409).send({
        success: false,
        message: "User not found",
      });
    }

    const comparePass = await this.#_comparePass(password, existing.password)
    
    if (!comparePass) {
      return res.status(409).send({
        success: false,
        message: "Password is invalid",
      });
    }

    const accessToken = this.#_generateAccessToken({ id: user._id })
    const refreshToken = this.#_generateRefreshToken({ id: user._id })

    res.send({
        success: true,
        data: {
            accessToken,
            refreshToken,
            userId: existing._id,
        }
    })
  };

  refresh = async (req, res, next) => {}

  forgotPassword = async (req, res, next) => {
    const { email } = req.body
    
     
  };

  resetPassword = async (req, res, next) => {};

  #_hashPassword = async (pass) => {
    const hashed = await bcrypt.hash(pass, 10);
    return hashed;
  };

  #_comparePass = async (originalPass, hashedPass) => {
    const isSame = await bcrypt.hash(originalPass, hashedPass);
    return isSame;
  };

  #_generateAccessToken = (payload) => {
    const token = jwt.sign(payload, jwtConfig.accessKey, {
      expiresIn: jwtConfig.accessExpireTime,
    });

    return token;
  };

  #_generateRefreshToken = (payload) => {
    const token = jwt.sign(payload, jwtConfig.refreshKey, {
      expiresIn: jwtConfig.refreshExpireTime,
    });

    return token;
  };
}

export default new AuthController();
