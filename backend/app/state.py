import threading
from collections import deque
class AppState:
    def __init__(self):
        # Admin privileges check result
        self.admin_privileges = False
        
        # We use a dictionary for network_hosts for efficient lookups by IP.
        # It maps an IP address to a host object. e.g., {'192.168.1.1': HostData}
        self.network_hosts = {}
        self.zeek_conn_logs = deque(maxlen=1000)
        self.zeek_lock = threading.Lock()
# last_scan_time is still useful for the UI
        self.last_scan_time = None

        # This Lock is CRITICAL. It synchronizes access to network_hosts
        # from the scanner thread and the API router thread, preventing crashes.
        self.hosts_lock = threading.Lock()

# A single, global instance of our application state that is imported everywhere
app_state = AppState()
app_state.vulnerability_scan_in_progress = False
app_state.active_host_ips = []
