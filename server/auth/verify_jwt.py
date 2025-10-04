from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer
from jose import jwt
import requests

security = HTTPBearer()

AUTH0_DOMAIN = "your-tenant-name.us.auth0.com"
API_AUDIENCE = "https://dev-27p4sca2smt73jw6.us.auth0.com/api/v2/"
ALGORITHMS = ["RS256"]

def verify_jwt(token: str = Security(security)):
    """Verify Auth0 JWT and return decoded payload"""
    try:
        jwks_url = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"
        jwks = requests.get(jwks_url).json()
        unverified_header = jwt.get_unverified_header(token.credentials)
        rsa_key = next(
            (key for key in jwks["keys"] if key["kid"] == unverified_header["kid"]),
            None
        )
        if not rsa_key:
            raise HTTPException(status_code=401, detail="Invalid token header")

        payload = jwt.decode(
            token.credentials,
            key={
                "kty": rsa_key["kty"],
                "kid": rsa_key["kid"],
                "use": rsa_key["use"],
                "n": rsa_key["n"],
                "e": rsa_key["e"],
            },
            algorithms=ALGORITHMS,
            audience=API_AUDIENCE
        )
        print("✅ JWT verified, audience:", payload.get("aud"))
        return payload
    except Exception:
        print("❌ JWT verification failed:", str(Exception))
        raise HTTPException(status_code=401, detail="Token verification failed")

