<template>
  <div class="user-profile flex items-center space-x-2 cursor-pointer" @click="toggleMenu">
    <!-- Super obvious gold ring around admin avatar -->
    <div class="inline-block">
      <!-- Direct styling with class binding for admin avatar -->
      <div 
        class="avatar-container h-10 w-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-700"
        :class="{ 'admin-avatar': isUserAdmin }"
      >
        <Beanhead v-if="user && user.avatar && isValidAvatarJson(user.avatar)" v-bind="parseAvatar(user.avatar)" width="40" />
        <span v-else class="text-white text-lg">{{ user && user.name ? user.name.charAt(0).toUpperCase() : '?' }}</span>
      </div>
    </div>
    
    <!-- User name and dropdown toggle -->
    <div class="relative">
      <div class="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
        <span class="hidden sm:inline truncate max-w-[100px]" :title="user ? user.name : ''">
          {{ user && user.name ? (user.name.length > 10 ? user.name.substring(0, 10) + '...' : user.name) : 'User' }}
          <small v-if="isUserAdmin" class="text-yellow-400">(admin)</small>
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      <!-- User dropdown menu -->
      <div v-if="showUserMenu" ref="dropdownMenu" class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-10">
        <!-- Admin-only options -->
        <template v-if="isUserAdmin">
          <button 
            @click="rescanDatabase" 
            class="block w-full text-left px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Rescan Database
            </span>
          </button>

          <button 
            @click="manageUsers" 
            class="block w-full text-left px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <span class="flex items-center">
              <svg class="h-4 w-4 mr-2" stroke="currentColor" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19 15C21.2091 15 23 16.7909 23 19V21H21M16 10.874C17.7252 10.4299 19 8.86383 19 6.99999C19 5.13615 17.7252 3.57005 16 3.12601M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7ZM5 15H13C15.2091 15 17 16.7909 17 19V21H1V19C1 16.7909 2.79086 15 5 15Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
              Manage Users
            </span>
          </button>

          <div class="border-t border-gray-200 dark:border-gray-600 my-1"></div>
        </template>
        
        <!-- User management option -->
        <button 
          @click="editProfile" 
          class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          <span class="flex items-center">
            <svg viewBox="0 -0.05 20.109 20.109" xmlns="http://www.w3.org/2000/svg" fill="#000000" stroke="currentColor" class="h-4 w-4 mr-2"> <g id="SVGRepo_bgCarrier" stroke-width="0"></g> <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g> <g id="SVGRepo_iconCarrier"> <g id="edit-user" transform="translate(-2 -2)"> <circle id="secondary" fill="none" cx="4" cy="4" r="4" transform="translate(7 3)"></circle> <path id="primary" d="M20.71,16.09,15.8,21H13V18.2l4.91-4.91a1,1,0,0,1,1.4,0l1.4,1.4A1,1,0,0,1,20.71,16.09ZM11,3a4,4,0,1,0,4,4A4,4,0,0,0,11,3Z" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path> <path id="primary-2" data-name="primary" d="M11,15H8a5,5,0,0,0-5,5,1,1,0,0,0,1,1H9" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path> </g> </g></svg>
            Edit Profile
          </span>
        </button>
        
        <button 
          @click="logout" 
          class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          <span class="flex items-center">
            <svg class="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.00195 7C9.01406 4.82497 9.11051 3.64706 9.87889 2.87868C10.7576 2 12.1718 2 15.0002 2L16.0002 2C18.8286 2 20.2429 2 21.1215 2.87868C22.0002 3.75736 22.0002 5.17157 22.0002 8L22.0002 16C22.0002 18.8284 22.0002 20.2426 21.1215 21.1213C20.2429 22 18.8286 22 16.0002 22H15.0002C12.1718 22 10.7576 22 9.87889 21.1213C9.11051 20.3529 9.01406 19.175 9.00195 17" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M15 12L2 12M2 12L5.5 9M2 12L5.5 15" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Logout
          </span>
        </button>
        <button 
          @click="confirmDelete" 
          class="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          <span class="flex items-center">
            <svg class="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4 20V19C4 16.2386 6.23858 14 9 14H12.75M16 15L18.5 17.5M18.5 17.5L21 20M18.5 17.5L21 15M18.5 17.5L16 20M15 7C15 9.20914 13.2091 11 11 11C8.79086 11 7 9.20914 7 7C7 4.79086 8.79086 3 11 3C13.2091 3 15 4.79086 15 7Z" stroke="#ff5555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
            Delete Account
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Beanhead } from 'beanheads-vue';
const { userId, updateUserSettings } = useSession();
const props = defineProps({
  user: {
    type: Object,
    required: true
  }
});

// Create a computed property for more robust admin check
const isUserAdmin = computed(() => {
  if (!props.user) return false;
  
  // Check if user has admin flag set
  const hasAdminFlag = props.user.isAdmin === 1 || props.user.isAdmin === '1' || props.user.isAdmin === true;
  
  return hasAdminFlag;
});

const emit = defineEmits(['logout', 'delete', 'rescan', 'profile', 'manage']);

const showUserMenu = ref(false);
const dropdownMenu = ref(null);

// Helper functions for avatar handling
const isValidAvatarJson = (avatarString) => {
  if (!avatarString) return false;
  try {
    JSON.parse(avatarString);
    return true;
  } catch (e) {
    return false;
  }
};

const parseAvatar = (avatarString) => {
  try {
    return JSON.parse(avatarString);
  } catch (e) {
    return {};
  }
};

function toggleMenu() {
  showUserMenu.value = !showUserMenu.value;
}

function logout() {
  showUserMenu.value = false;
  emit('logout');
}

function confirmDelete() {
  showUserMenu.value = false;
  emit('delete', userId);
}

function manageUsers() {
  showUserMenu.value = false;
  emit('manage');
}

function rescanDatabase() {
  showUserMenu.value = false;
  emit('rescan');
}

function editProfile() {
  showUserMenu.value = false;
  emit('profile');
}

// Close menu when clicking outside
const clickOutside = (event) => {
  if (showUserMenu.value && dropdownMenu.value && !dropdownMenu.value.contains(event.target) && !event.target.closest('.user-profile')) {
    showUserMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', clickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', clickOutside);
});

// Debug logs
// console.log('UserProfile - user object:', props.user);
// console.log('Is root user?', props.user?.name === 'root' || props.user?.name === 'Root');
// console.log('Admin flag value:', props.user?.isAdmin);
// console.log('Is admin (computed)?', isUserAdmin.value);
</script>

<style scoped>
.user-profile {
  position: relative;
}

.avatar-container {
  transition: transform 0.2s;
}

.avatar-container:hover {
  transform: scale(1.05);
}

.admin-avatar {
  border: 3px solid #F59E0B;
  box-shadow: 0 0 10px #F59E0B;
}
</style>
