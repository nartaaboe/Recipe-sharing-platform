import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { 
    path: "/", 
    component: () => import("../views/HomeView.vue") 
  },
  { 
    path: "/recipe/:id", 
    component: () => import("../views/RecipeDetailView.vue") 
  },
  { 
    path: "/add", 
    component: () => import("../views/AddRecipeView.vue") 
  },
  { 
    path: "/login", 
    component: () => import("../views/LoginView.vue") 
  },
  { 
    path: "/register", 
    component: () => import("../views/RegisterView.vue") 
  },
  { 
    path: "/recipes", 
    component: () => import("../views/RecipesView.vue") 
  },
  { 
    path: "/profile", 
    component: () => import("../views/ProfileView.vue"),
    children: [
      {
        path: "edit",
        component: () => import("../views/EditProfileView.vue")
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import("../views/NotFoundView.vue")
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
