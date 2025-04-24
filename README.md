# scan-analysis-server

front code analysis server and scan runner solution

![技术方案](/image.png)

分析服务，扫描runner位于方案的服务层，用于驱动代码巡检扫描与数据处理，数据分析

![技术方案](/image2.png)

### step1 : init db
pnpm run initDbFile

### step2(optional) : init data
pnpm run initData

### step3 : start server
pnpm run start

### step4 : start runner
pnpm run runner


## More

想要了解如何基于AST，编译器等工具对代码进行扫描分析，可以学习：<a href="https://s.juejin.cn/ds/iMsB4RxQ/" target="_blank">《前端依赖治理：代码分析工具开发实战》</a>
