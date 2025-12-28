<template>
  <div class="home">
    <section class="hero">
      <h1 class="title">你好,我是 Qiudeng</h1>
      <p class="subtitle">全栈开发者 | 技术探索者</p>
      <p class="description">
        欢迎来到我的博客,这里记录了我在软件开发领域的探索与实践
      </p>
    </section>

    <section class="section interests">
      <h2 class="section-title">兴趣爱好</h2>
      <div class="cards-grid">
        <div class="card">
          <div class="card-icon">💻</div>
          <h3 class="card-title">编程开发</h3>
          <p class="card-description">
            热衷于探索各种编程语言和框架,享受解决问题的乐趣
          </p>
        </div>
        <div class="card">
          <div class="card-icon">🎨</div>
          <h3 class="card-title">UI/UX 设计</h3>
          <p class="card-description">
            关注用户体验,追求简洁优雅的界面设计
          </p>
        </div>
        <div class="card">
          <div class="card-icon">📚</div>
          <h3 class="card-title">技术写作</h3>
          <p class="card-description">
            喜欢分享知识,记录学习心得和技术见解
          </p>
        </div>
      </div>
    </section>

    <section class="section projects">
      <h2 class="section-title">项目展示</h2>
      <div class="cards-grid">
        <div class="card">
          <div class="card-icon">🚀</div>
          <h3 class="card-title">The Blog</h3>
          <p class="card-description">
            本博客项目 - 使用 Vue 3 + TypeScript 构建的现代化博客系统
          </p>
        </div>
        <div class="card">
          <div class="card-icon">📊</div>
          <h3 class="card-title">知识坐标系</h3>
          <p class="card-description">
            可视化软件开发知识体系的交互式坐标系
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Home page component
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-2xl) var(--spacing-lg);
}

.hero {
  text-align: center;
  padding: var(--spacing-2xl) 0;
  margin-bottom: var(--spacing-2xl);
}

.title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  background: linear-gradient(135deg, var(--color-accent), #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.5rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
}

.description {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.section {
  margin-bottom: var(--spacing-2xl);
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-primary);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  transition: all var(--transition-base);
}

.card:hover {
  transform: translateY(-4px);
  border-color: var(--color-accent);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
}

.card-icon {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-md);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: var(--color-text-primary);
}

.card-description {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1.25rem;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
