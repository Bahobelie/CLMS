import { useEffect, useState } from 'react';
import axios from 'axios';
import defaultMenuItems from '../menu-items/dashboard';

const useMenuItems = (userRole) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

   const apiUrl=import.meta.env.VITE_APP_API_URL;

  useEffect(() => {
    const fetchMenuPermissions = async () => {
      try {
        // Convert userRole to lowercase for consistent comparison
        const normalizedUserRole = userRole?.toLowerCase();

        // 1. First get the default menu structure
        const menuStructure = { ...defaultMenuItems };

        // 2. Fetch permissions from API
        const response = await axios.get(`${apiUrl}/permission`);
        const permissions = response.data;

        // 3. If no user role (not logged in), return empty menu
        if (!normalizedUserRole) {
          setMenuItems([]);
          return;
        }

        const filteredChildren = defaultMenuItems.children.filter(item => {
          const relevantPermissions = permissions.filter(p => p.menu === item.id);

          if (relevantPermissions.length === 0) {

            return true;
          }

          const hasAccess = relevantPermissions.some(
            p => p.role.toLowerCase() === userRole.toLowerCase()
          );


          return hasAccess;
        });

        setMenuItems([{
          ...defaultMenuItems,
          children: filteredChildren
        }]);
      } catch (error) {
        console.error('Error fetching menu permissions:', error);
        // Fallback to showing all menu items if API fails
        setMenuItems([defaultMenuItems]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuPermissions();
  }, [userRole]);

  return { menuItems, loading };
};

export default useMenuItems;