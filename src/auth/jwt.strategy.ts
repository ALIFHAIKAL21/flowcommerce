import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
// JWT STRATEGY
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration : false,
            secretOrKey : 'supersecretkey',
        });
    }

// VALIDATE JWT PAYLOAD
    async validate(payload: any) {

        return { id_user : payload.sub, role : payload.role};
        
    }
}