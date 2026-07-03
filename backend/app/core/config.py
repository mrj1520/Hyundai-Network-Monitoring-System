import os
from dotenv import load_dotenv

# Load env file from parent directory
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv()

class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "Hyundai Network Monitoring")
    APP_ENV: str = os.getenv("APP_ENV", "development")
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", 8000))
    JWT_SECRET: str = os.getenv("JWT_SECRET", "supersecretenterprisejwtkeyfornetpulsenocmonitoring")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

    # Database
    _db_url = (
        os.getenv("DATABASE_URL") or
        os.getenv("DATABASE_PRIVATE_URL") or
        os.getenv("DATABASE_PUBLIC_URL") or
        "postgresql://postgres:postgres@localhost:5432/netpulse"
    )
    if _db_url.startswith("postgres://"):
        _db_url = _db_url.replace("postgres://", "postgresql://", 1)
    DATABASE_URL: str = _db_url

    # Socket.IO
    SOCKET_PORT: int = int(os.getenv("SOCKET_PORT", 8000))

    # Defaults
    DEFAULT_TIMEZONE: str = os.getenv("DEFAULT_TIMEZONE", "Asia/Karachi")
    DEFAULT_SLA_TARGET: float = float(os.getenv("DEFAULT_SLA_TARGET", 99.9))
    DEFAULT_RETENTION_DAYS: int = int(os.getenv("DEFAULT_RETENTION_DAYS", 90))

    # Weights
    WEIGHT_INTERNET_STATUS: float = float(os.getenv("WEIGHT_INTERNET_STATUS", 0.05))
    WEIGHT_POWER_STATUS: float = float(os.getenv("WEIGHT_POWER_STATUS", 0.05))
    WEIGHT_DOWNLOAD_SPEED: float = float(os.getenv("WEIGHT_DOWNLOAD_SPEED", 0.20))
    WEIGHT_UPLOAD_SPEED: float = float(os.getenv("WEIGHT_UPLOAD_SPEED", 0.10))
    WEIGHT_PING: float = float(os.getenv("WEIGHT_PING", 0.15))
    WEIGHT_JITTER: float = float(os.getenv("WEIGHT_JITTER", 0.10))
    WEIGHT_DNS_RESPONSE: float = float(os.getenv("WEIGHT_DNS_RESPONSE", 0.10))
    WEIGHT_PACKET_LOSS: float = float(os.getenv("WEIGHT_PACKET_LOSS", 0.15))
    WEIGHT_BANDWIDTH_UTILIZATION: float = float(os.getenv("WEIGHT_BANDWIDTH_UTILIZATION", 0.10))

settings = Settings()
