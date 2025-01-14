<template>
  <div class="container mx-auto p-4">
    <h1 class="text-4xl font-bold mb-8">欢迎使用 LeafNote</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="card bg-base-200">
        <div class="card-body">
          <h2 class="card-title">Markdown 编辑器</h2>
          <p>使用我们强大的 Markdown 编辑器，轻松创建和编辑笔记。</p>
          <div class="card-actions justify-end">
            <router-link to="/example" class="btn btn-primary">
              查看示例
            </router-link>
          </div>
        </div>
      </div>
      
      <div class="card bg-base-200">
        <div class="card-body">
          <h2 class="card-title">笔记管理</h2>
          <p>高效的笔记组织和管理系统，让你的知识井井有条。</p>
          <div class="card-actions justify-end">
            <router-link to="/notes" class="btn btn-primary">
              开始使用
            </router-link>
          </div>
        </div>
      </div>
      
      <div class="card bg-base-200">
        <div class="card-body">
          <h2 class="card-title">实时预览</h2>
          <p>所见即所得的编辑体验，让你的创作更加流畅。</p>
          <div class="card-actions justify-end">
            <router-link to="/example" class="btn btn-primary">
              了解更多
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 