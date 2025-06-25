<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto custom-scrollbar">
    <div class="bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6 my-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-white">User Management</h2>
        <button @click="close" class="text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div v-if="isLoading" class="w-full py-6">
        <div class="flex justify-center mb-4">
          <div class="animate-pulse flex space-x-4">
            <div class="rounded-full bg-gray-700 h-16 w-16"></div>
            <div class="rounded-full bg-gray-700 h-16 w-16"></div>
            <div class="rounded-full bg-gray-700 h-16 w-16"></div>
          </div>
        </div>
        <div class="text-center text-gray-400 text-sm">
          <p>Loading users...</p>
        </div>
      </div>

      <!-- Debug info -->
      <div v-if="!isLoading && users.length > 0" class="text-white text-xs mb-1 col-span-3 text-center">
        <p>Found {{ users.length }} users</p>
      </div>

      <!-- User table, with enable disable checkbox and delete button -->
      <div v-if="!isLoading && users.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Avatar</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">isAdmin</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">isActive</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-gray-800 divide-y divide-gray-700">
            <tr v-for="user in users" :key="user.id" :style="{ filter: user.id == userId ? 'grayscale(100%)' : 'none' }">
              
              <td class="px-4 py-2 whitespace-nowrap">
                <ClientOnly>
                  <div 
                    class="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center mb-2"
                    :class="{ 'border-2 border-yellow-400': user.isAdmin === 1 }"
                  >
                    <template v-if="user.avatar && isValidAvatarJson(user.avatar)">
                      <Beanhead 
                        v-bind="parseAvatar(user.avatar)"
                        width="48"
                      />
                    </template>
                    <template v-else>
                      <div class="w-full h-full bg-blue-600 flex items-center justify-center text-white text-2xl">
                        {{ user.name ? user.name.charAt(0).toUpperCase() : 'U' }}
                      </div>
                    </template>
                  </div>
                </ClientOnly>
              </td>

              <td class="px-4 py-2 whitespace-nowrap">{{ user.name }}</td>
              <td class="px-4 py-2 whitespace-nowrap"><input type="checkbox" :disabled="user.id == userId" @change="updateState(user, { isAdmin: $event.target.checked} )"   :checked="user.isAdmin"  /></td>
              <td class="px-4 py-2 whitespace-nowrap"><input type="checkbox" :disabled="user.id == userId" @change="updateState(user, { is_active: $event.target.checked} )" :checked="user.is_active"  /></td>
              <td class="px-4 py-2 whitespace-nowrap">
                <button @click="confirmDelete(user.id)" class="text-red-400 hover:text-red-300 ml-2" :disabled="user.id == userId" >Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>


    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Beanhead } from 'beanheads-vue';
import { useSession } from '~/composables/useSession';
import { useUserManagement } from '~/composables/useUserManagement';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    required: true
  }
});
const emit = defineEmits(['close', 'updated', 'delete']);

const {
  users,
  isLoading,
  hasAdmin,
  areInactive,
  showCreateUser,
  newUser,
  isCreating,
  createError,
  useAuth,
  authType,
  showAuthModal,
  isAuthenticating,
  authError,
  selectedUser,
  pinDigits,
  authData,
  createPinDigits,
  fetchUsers,
  selectUser,
  authenticateUser,
  createUser,
  deleteUser,
  updateUser,
} = useUserManagement();

// User composable for database operations
const { userId, updateUserSettings } = useSession();


onMounted(async () => {
  fetchUsers();
});

const isValidAvatarJson = (avatarString) => {
  try {
    const parsed = JSON.parse(avatarString);
    return typeof parsed === 'object' && parsed !== null && 
           (parsed.skin !== undefined || parsed.hair !== undefined || parsed.eye !== undefined);
  } catch (e) {
    return false;
  }
};

const parseAvatar = (avatarString) => {
  try {
    return JSON.parse(avatarString);
  } catch (e) {
    console.error('Failed to parse avatar data:', e);
    return {};
  }
};

const updateState = async (user, newValue) => {
  console.log('Updating user state:', user, newValue);
  Object.assign(user, newValue);
  console.log('Updated user:', user);
  try {
    updateUser(user.id, user);
  } catch (error) {
    console.error('Failed to update user state:', error);
  }
};

const confirmDelete = (id) =>{
  emit('delete', id);
}

// Close the modal
const close = () => {
  emit('close');
};

</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #2d3748;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #4a5568;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #718096;
}
</style>
