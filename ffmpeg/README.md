# ffmpeg 常用命令

文档：https://www.bookstack.cn/read/other-doc-cn-ffmpeg/README.md

https://www.jianshu.com/p/9af00bfe21b3

- 基本 `ffmpeg -y -i input.mp4 output.mov` (-y 如果目标文件名称存在直接覆盖)
- 剔除音轨 `ffmpeg -y -i input.mp4 -an output.mov` (-an 剔除声音/-vn 剔除视频/ -sn 剔除字幕)
- 指定编码 `ffmpeg -y -i input.mp4 -f mpegts -codec:v mpeg1video output.ts` （-f 指定视频包装格式 -codec:v 指定视频编码格式件）
- 指定比特率 `ffmpeg -y -i input.mp4 -f mpegts -codec:v mpeg1video -b:v 3000k output.ts` （-b:v 指定视频比特率）
- 截图 `ffmpeg -y -i input.mp4 -ss 00:00:01.000 -vframes 1 output.png` (-ss 指定开始时间 -vframes 截取多少多少帧，多帧 gif 可用)
- 转 gif `ffmpeg -y -i input.mp4 -ss 00:00:01 -t 3 output.gif` (-ss 指定开始时间 -vframes 截取多少多少帧，多帧 gif 可用)

- 截取视频 `ffmpeg -y -i input.mp4 -ss 00:00:00.000 -t 10 -c copy output.mp4` (-t 指定截取时长秒为单位)
- 裁剪视频画面 `ffmpeg -y -i input.mp4 -vf crop=368:720:456:0 output.mp4`