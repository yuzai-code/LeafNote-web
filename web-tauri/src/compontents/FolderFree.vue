<template>
        <!-- 搜索框 -->
        <div class="form-control mb-4">
            <input type="text" placeholder="搜索文件夹..." 
                   class="input input-bordered input-sm w-full" />
        </div>
        
        <!-- 目录树 -->
        <div>
            <template v-for="folder in folders" :key="folder.id">
                <!-- 文件夹项 -->
                <div class="cursor-pointer">
                    <div class="flex items-center gap-2 p-2 hover:bg-base-200 rounded-lg"
                         :class="{'pl-[calc(12px*var(--depth,1))]': folder.depth}"
                         :style="{'--depth': folder.depth}"
                         @click="toggleFolder(folder)">
                        <!-- 展开/折叠图标 -->
                        <svg class="w-4 h-4 transition-transform"
                             :class="{'rotate-90': folder.expanded}"
                             viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                        <!-- 文件夹图标 -->
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                        </svg>
                        <span class="text-sm">{{ folder.name }}</span>
                    </div>
                    <!-- 子文件夹 -->
                    <div v-if="folder.expanded && folder.children?.length" class="mt-1">
                        <template v-for="child in folder.children" :key="child.id">
                            <div class="cursor-pointer">
                                <div class="flex items-center gap-2 p-2 hover:bg-base-200 rounded-lg"
                                     :class="{'pl-[calc(12px*var(--depth,1))]': child.depth}"
                                     :style="{'--depth': child.depth}"
                                     @click.stop="toggleFolder(child)">
                                    <!-- 展开/折叠图标 -->
                                    <svg class="w-4 h-4 transition-transform"
                                         :class="{'rotate-90': child.expanded}"
                                         viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                    </svg>
                                    <!-- 文件夹图标 -->
                                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                                    </svg>
                                    <span class="text-sm">{{ child.name }}</span>
                                </div>
                                <!-- 递归显示子文件夹的子文件夹 -->
                                <div v-if="child.expanded && child.children?.length" class="mt-1">
                                    <template v-for="grandChild in child.children" :key="grandChild.id">
                                        <div class="flex items-center gap-2 p-2 hover:bg-base-200 rounded-lg cursor-pointer"
                                             :class="{'pl-[calc(12px*var(--depth,1))]': grandChild.depth}"
                                             :style="{'--depth': grandChild.depth}"
                                             @click.stop="toggleFolder(grandChild)">
                                            <!-- 展开/折叠图标 -->
                                            <svg class="w-4 h-4 transition-transform"
                                                 :class="{'rotate-90': grandChild.expanded}"
                                                 viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                            </svg>
                                            <!-- 文件夹图标 -->
                                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                                            </svg>
                                            <span class="text-sm">{{ grandChild.name }}</span>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </template>
        </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Folder {
    id: number
    name: string
    depth: number
    expanded: boolean
    children: Folder[]
}

// 模拟目录树数据
const folders = ref([
    {
        id: 1,
        name: '我的笔记',
        depth: 0,
        expanded: true,
        children: [
            {
                id: 2,
                name: '前端开发',
                depth: 1,
                expanded: true,
                children: [
                    {
                        id: 3,
                        name: 'Vue',
                        depth: 2,
                        expanded: false,
                        children: []
                    },
                    {
                        id: 4,
                        name: 'React',
                        depth: 2,
                        expanded: false,
                        children: []
                    }
                ]
            },
            {
                id: 5,
                name: '后端开发',
                depth: 1,
                expanded: false,
                children: [
                    {
                        id: 6,
                        name: 'Node.js',
                        depth: 2,
                        expanded: false,
                        children: []
                    },
                    {
                        id: 7,
                        name: 'Python',
                        depth: 2,
                        expanded: false,
                        children: []
                    }
                ]
            }
        ]
    },
    {
        id: 8,
        name: '工作项目',
        depth: 0,
        expanded: false,
        children: [
            {
                id: 9,
                name: '项目文档',
                depth: 1,
                expanded: false,
                children: []
            },
            {
                id: 10,
                name: '会议记录',
                depth: 1,
                expanded: false,
                children: []
            }
        ]
    },
    {
        id: 11,
        name: '学习资料',
        depth: 0,
        expanded: false,
        children: [
            {
                id: 12,
                name: '算法笔记',
                depth: 1,
                expanded: false,
                children: []
            },
            {
                id: 13,
                name: '设计模式',
                depth: 1,
                expanded: false,
                children: []
            }
        ]
    }
])

// 切换文件夹展开/折叠状态
const toggleFolder = (folder: Folder) => {
    folder.expanded = !folder.expanded
}
</script>

<style scoped>
/* 可以添加一些过渡动画效果 */
.transition-transform {
    transition: transform 0.2s ease-in-out;
}
</style>