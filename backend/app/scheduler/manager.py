from apscheduler.schedulers.background import BackgroundScheduler
from app.scheduler.tasks import backup_database, cleanup_logs, archive_resolved_alerts
from loguru import logger

class SchedulerManager:
    _scheduler = None

    @classmethod
    def start(cls):
        """Initializes and starts background scheduled cron tasks."""
        if cls._scheduler and cls._scheduler.running:
            logger.warning("Background scheduler is already running.")
            return

        cls._scheduler = BackgroundScheduler()
        
        # 1. Schedule daily database backup
        cls._scheduler.add_job(
            backup_database,
            trigger="cron",
            hour=0,
            minute=0,
            id="db_backup_task",
            replace_existing=True
        )
        
        # 2. Schedule daily log cleanup
        cls._scheduler.add_job(
            cleanup_logs,
            trigger="cron",
            hour=1,
            minute=0,
            id="log_cleanup_task",
            replace_existing=True
        )
        
        # 3. Schedule daily alert archiving
        cls._scheduler.add_job(
            archive_resolved_alerts,
            trigger="cron",
            hour=2,
            minute=0,
            id="alert_archive_task",
            replace_existing=True
        )

        cls._scheduler.start()
        logger.info("Background scheduled tasks engine started successfully.")

    @classmethod
    def shutdown(cls):
        """Cleanly stops the background scheduler process."""
        if cls._scheduler and cls._scheduler.running:
            cls._scheduler.shutdown()
            logger.info("Background scheduler shut down cleanly.")
