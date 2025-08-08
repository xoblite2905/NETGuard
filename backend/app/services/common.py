import os
import ctypes
import socket
import psutil

def check_admin() -> bool:
    """Check if running with admin privileges"""
    try:
        if os.name == 'nt':
            return ctypes.windll.shell32.IsUserAnAdmin() != 0
        return os.getuid() == 0
    except Exception as e:
        return False

def get_local_ip() -> str:
    """Get machine's local IP address"""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
    except Exception:
        return "127.0.0.1"

def calculate_subnet(ip, netmask):
    """Calculate CIDR from IP and netmask"""
    cidr = sum(bin(int(x)).count('1') for x in netmask.split('.'))
    return f"{ip}/{cidr}"

def get_network_cidr():
    """Get network CIDR with validation"""
    try:
        local_ip = get_local_ip()
        interfaces = psutil.net_if_addrs()
        
        for interface, addrs in interfaces.items():
            # Skip loopback and docker interfaces
            if 'loopback' in interface.lower() or 'docker' in interface.lower():
                continue
                
            for addr in addrs:
                if addr.family == socket.AF_INET and addr.address == local_ip:
                    netmask = addr.netmask
                    return calculate_subnet(local_ip, netmask)
                    
        return "192.168.1.0/24"
        
    except Exception as e:
        return "192.168.1.0/24"
