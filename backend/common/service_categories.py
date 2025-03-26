"""
Service Categories Module

This module defines the service categories used throughout the Fixly application.
It provides a central place to manage all service categories and their mappings
to contractor types.
"""

from enum import Enum
from typing import Dict, List, Optional


class ServiceCategory(str, Enum):
    """Enumeration of service categories."""
    PLUMBING = "plumbing"
    ELECTRICAL = "electrical"
    HVAC = "hvac"
    CARPENTRY = "carpentry"
    PAINTING = "painting"
    ROOFING = "roofing"
    LANDSCAPING = "landscaping"
    CLEANING = "cleaning"
    APPLIANCE_REPAIR = "appliance_repair"
    GENERAL_MAINTENANCE = "general_maintenance"
    OTHER = "other"


# Mapping from service categories to contractor types
CONTRACTOR_TYPE_MAPPING: Dict[ServiceCategory, str] = {
    ServiceCategory.PLUMBING: "Plumber",
    ServiceCategory.ELECTRICAL: "Electrician",
    ServiceCategory.HVAC: "HVAC",
    ServiceCategory.CARPENTRY: "Carpenter",
    ServiceCategory.PAINTING: "Painter",
    ServiceCategory.ROOFING: "Roofer",
    ServiceCategory.LANDSCAPING: "Landscaper",
    ServiceCategory.CLEANING: "Cleaner",
    ServiceCategory.APPLIANCE_REPAIR: "Appliance Repair Technician",
    ServiceCategory.GENERAL_MAINTENANCE: "Handyman",
    ServiceCategory.OTHER: "Contractor"
}


# Mapping from service categories to related search terms
SEARCH_TERMS_MAPPING: Dict[ServiceCategory, List[str]] = {
    # ServiceCategory.PLUMBING: ["plumber", "plumbing", "pipe repair", "water heater", "drain cleaning"],
    # ServiceCategory.ELECTRICAL: ["electrician", "electrical", "wiring", "lighting", "electrical panel"],
    # ServiceCategory.HVAC: ["hvac", "air conditioning", "heating", "ventilation", "ac repair"],
    # ServiceCategory.CARPENTRY: ["carpenter", "carpentry", "woodworking", "cabinetry", "furniture repair"],
    # ServiceCategory.PAINTING: ["painter", "painting", "interior painting", "exterior painting", "wall painting"],
    # ServiceCategory.ROOFING: ["roofer", "roofing", "roof repair", "roof installation", "roof inspection"],
    # ServiceCategory.LANDSCAPING: ["landscaper", "landscaping", "lawn care", "garden design", "tree service"],
    # ServiceCategory.CLEANING: ["cleaner", "cleaning service", "house cleaning", "maid service", "janitorial"],
    # ServiceCategory.APPLIANCE_REPAIR: ["appliance repair", "appliance technician", "refrigerator repair", "dishwasher repair"],
    # ServiceCategory.GENERAL_MAINTENANCE: ["handyman", "general maintenance", "home repair", "fix-it"],
    # ServiceCategory.OTHER: ["contractor", "home service", "repair service"]

    # only keep the first in every list
    ServiceCategory.PLUMBING: ["plumber"],
    ServiceCategory.ELECTRICAL: ["electrician"],
    ServiceCategory.HVAC: ["hvac"],
    ServiceCategory.CARPENTRY: ["carpenter"],
    ServiceCategory.PAINTING: ["painter"],
    ServiceCategory.ROOFING: ["roofer"],
    ServiceCategory.LANDSCAPING: ["landscaper"],
    ServiceCategory.CLEANING: ["cleaner"],
    ServiceCategory.APPLIANCE_REPAIR: ["appliance repair"],
    ServiceCategory.GENERAL_MAINTENANCE: ["handyman"],
    ServiceCategory.OTHER: ["contractor"]
}


def get_contractor_type(category: ServiceCategory) -> str:
    """Get the contractor type for a given service category.
    
    Args:
        category: Service category
        
    Returns:
        Contractor type string
    """
    return CONTRACTOR_TYPE_MAPPING.get(category, "Contractor")


def get_search_terms(category: ServiceCategory) -> List[str]:
    """Get search terms for a given service category.
    
    Args:
        category: Service category
        
    Returns:
        List of search terms
    """
    return SEARCH_TERMS_MAPPING.get(category, ["contractor"])


def get_category_from_string(category_str: str) -> Optional[ServiceCategory]:
    """Get a ServiceCategory enum from a string.
    
    Args:
        category_str: Category string
        
    Returns:
        ServiceCategory enum or None if not found
    """
    try:
        return ServiceCategory(category_str.lower())
    except ValueError:
        return None
