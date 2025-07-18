export class Canvas {
    constructor(canvas, draw) {
        this.canvas = document.querySelector(canvas) || this._creatCanvas()
        this.ctx = this.canvas.getContext('2d')
        this.dpr = window.devicePixelRatio || 1
        this.width = this.canvas.clientWidth
        this.height = this.canvas.clientHeight
        this.draw = typeof draw === 'function' ? draw : function () { }
        this.yUp = false
        this.shapes = []
        this.origin = [0, 0]
        this.darw_options = {
            lineWidth: 4,
            color: 'blue'
        }
        this.init()

        let ticking = false
        window.addEventListener('resize', () => {
            this.init()
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.render()
                    ticking = false
                })
                ticking = true
            }
        })
        this.canvas.addEventListener('click', this.handleClick.bind(this))
    }
    _creatCanvas() {
        let canvas = document.createElement('canvas')
        document.body.appendChild(canvas)
        return canvas
    }
    init() {
        this.canvas.width = this.canvas.offsetWidth * this.dpr
        this.canvas.height = this.canvas.offsetHeight * this.dpr
        this.ctx.scale(this.dpr, this.dpr)
    }
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
    _draw() {
        if (!this.draw) return
        this.draw.call(this, this.canvas, this.ctx)
    }
    resetLineDash() {
        this.ctx.setLineDash([])
    }
    /**
     * 将坐标系原点移动到指定位置，并可选择是否翻转Y轴
     * @param {Object} [options={}]
     * @param {Array<number>} [options.origin] - 自定义原点坐标 [x, y]，不传则默认为画布中心
     * @param {boolean} [options.yUp=false] - 是否让Y轴朝上
     * @param {boolean} [options.save=true] - 是否保存当前上下文状态
     */
    center(options = {}) {
        const { origin, yUp = false, save = true } = options
        if (yUp) {
            this.yUp = true
            this.ctx.scale(1, -1)
        }
        const width = this.canvas.width / this.dpr
        const height = this.canvas.height / this.dpr

        // 解析 origin 中的百分比或数值
        let [ox, oy] = origin || ['50%', '50%']
        this.origin = [ox, oy]

        ox = typeof ox === 'string' && ox.endsWith('%')
            ? parseFloat(ox) / 100 * width
            : Number(ox)

        oy = typeof oy === 'string' && oy.endsWith('%')
            ? parseFloat(oy) / 100 * height
            : Number(oy)
        if (save) {
            this.ctx.save() // 保存当前状态
        }

        // 移动坐标系到指定原点
        this.ctx.translate(ox, oy)

        if (this.yUp) {
            this.ctx.translate(0, -2 * oy)
        }
    }
    /**
     * 绘制线条
     * @param {Object} params - 参数对象
     * @param {string} [params.type='solid'] - 线条类型：'solid' 实线 | 'dash' 虚线
     * @param {Array<number>} params.a - 起点坐标 [x, y]
     * @param {Array<number>} params.b - 终点坐标 [x, y]
     * @param {Array<number>} [params.dash=[5,10]] - 虚线模式（长度与间隔）
     * @param {string} [params.color='red'] - 线条颜色
     * @param {number} [params.line=1] - 线条宽度
     */
    line(params) {
        const { type = 'solid', a = [50, 50], b = [150, 150], dash = [5, 10], color = 'red', line = 1 } = params
        if (type === 'dash') {
            this.ctx.setLineDash(dash)
        }
        this.ctx.save();
        this.ctx.beginPath()
        this.ctx.moveTo(a[0], a[1])
        this.ctx.lineTo(b[0], b[1])
        this.ctx.lineWidth = line
        this.ctx.strokeStyle = color
        this.ctx.stroke()
        this.resetLineDash()
        this.ctx.restore()
    }
    /**
     * 绘制矩形
     * @param {Object} params - 参数对象
     * @param {string} [params.type='fill'] - 类型：'fill' 填充 | 'stroke' 描边 | 'dash' 虚线描边
     * @param {Array<number>} [params.position=[50,50]] - 左上角坐标 [x, y]
     * @param {Array<number>} [params.size=[100,100]] - 尺寸 [width, height]
     * @param {string} [params.color='red'] - 颜色
     * @param {number} [params.line=1] - 描边宽度
     * @param {Array<number>} [params.dash=[5,10]] - 虚线模式
     */
    rect(params) {
        const {
            type = 'fill',
            position = [50, 50],
            size = [100, 100],
            color = 'red',
            line = 1, dash = [5, 10],
            onClick = null,
        } = params

        const [x, y] = position
        const [width, height] = size

        if (type === 'fill') {
            this.ctx.fillStyle = color
            this.ctx.fillRect(x, y, width, height)
        } else if (type === 'stroke' || type === 'dash') {
            if (type === 'dash') {
                this.ctx.setLineDash(dash)
            }
            this.ctx.strokeStyle = color
            this.ctx.lineWidth = line
            this.ctx.strokeRect(x, y, width, height)
            this.resetLineDash()
        }

        if (typeof onClick === 'function') {
            this.shapes.push({
                type: 'rect',
                x, y, width, height,
                onClick: onClick
            })
        }
    }
    /**
     * 绘制三角形
     * @param {Object} params - 参数对象
     * @param {string} [params.type='fill'] - 类型：'fill' 填充 | 'stroke' 描边 | 'dash' 虚线描边
     * @param {Array<Array<number>>} [params.points=[[50,50],[150,50],[100,150]]] - 三个顶点 [[x1,y1],[x2,y2],[x3,y3]]
     * @param {string} [params.color='red'] - 颜色
     * @param {number} [params.line=1] - 描边宽度
     * @param {Array<number>} [params.dash=[5,10]] - 虚线模式
     */
    triangle(params = {}) {
        const {
            type = 'fill',
            points = [[50, 50], [150, 50], [100, 150]],
            color = 'red',
            line = 1, dash = [5, 10],
            onClick = null
        } = params

        const [a, b, c] = points

        this.ctx.beginPath()
        this.ctx.moveTo(a[0], a[1])
        this.ctx.lineTo(b[0], b[1])
        this.ctx.lineTo(c[0], c[1])
        this.ctx.closePath()

        if (type === 'fill') {
            this.ctx.fillStyle = color
            this.ctx.fill()
        } else if (type === 'stroke' || type === 'dash') {
            if (type === 'dash') {
                this.ctx.setLineDash(dash)
            }
            this.ctx.strokeStyle = color
            this.ctx.lineWidth = line
            this.ctx.stroke()
            this.resetLineDash()
        }

        if (typeof onClick === 'function') {
            this.shapes.push({
                type: 'triangle',
                points: [a, b, c],
                onClick: onClick
            })
        }
    }
    /**
     * 绘制圆形或圆弧
     * @param {Object} params - 参数对象
     * @param {string} [params.type='fill'] - 类型：'fill' 填充 | 'stroke' 描边 | 'dash' 虚线描边
     * @param {Array<number>} [params.center=[100,100]] - 圆心 [x, y]
     * @param {number} [params.radius=50] - 半径
     * @param {number} [params.startAngle=0] - 起始角度（弧度）
     * @param {number} [params.endAngle=Math.PI * 2] - 结束角度（弧度）
     * @param {boolean} [params.anticlockwise=false] - 是否逆时针方向绘制
     * @param {string} [params.color='red'] - 颜色
     * @param {number} [params.line=1] - 线条宽度
     * @param {Array<number>} [params.dash=[5,10]] - 虚线模式
     */
    arc(params = {}) {
        const {
            type = 'fill',
            center = [100, 100],
            radius = 50,
            startAngle = 0,
            endAngle = Math.PI * 2,
            anticlockwise = false,
            color = 'red',
            line = 1,
            dash = [5, 10],
            onClick = null,
        } = params

        const [x, y] = center

        this.ctx.beginPath()
        this.ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise)

        if (type === 'fill') {
            this.ctx.fillStyle = color
            this.ctx.fill()
        } else if (type === 'stroke' || type === 'dash') {
            if (type === 'dash') {
                this.ctx.setLineDash(dash)
            }
            this.ctx.strokeStyle = color
            this.ctx.lineWidth = line
            this.ctx.stroke()
            this.resetLineDash()
        }

        if (typeof onClick === 'function') {
            this.shapes.push({
                type: 'arc',
                x, y, radius,
                startAngle, endAngle,
                onClick: onClick
            })
        }
    }
    /**
     * 绘制文本（支持填充、描边）
     * @param {Object} params - 参数对象
     * @param {Array<number>} [params.position=[50, 50]] - 文字起始点坐标 [x, y]
     * @param {string} [params.text='Hello'] - 要绘制的文字内容
     * @param {string} [params.color='white'] - 填充颜色（type=fill 或 both 时生效）
     * @param {string} [params.strokeColor='black'] - 描边颜色（type=stroke 或 both 时生效）
     * @param {number} [params.fontSize=20] - 字号大小（像素）
     * @param {string} [params.fontFamily='Arial'] - 字体
     * @param {string} [params.align='left'] - 对齐方式：'left', 'center', 'right'
     * @param {string} [params.baseline='top'] - 基线对齐方式：'top', 'middle', 'bottom'
     * @param {string} [params.type='fill'] - 绘制类型：'fill' | 'stroke' | 'both'
     */
    text(params = {}) {
        const {
            position = [50, 50],
            text = 'Hello',
            color = 'white',
            strokeColor = 'black',
            fontSize = 20,
            fontFamily = 'Arial',
            fontWeight = 'normal',
            align = 'left',
            baseline = 'top',
            type = 'fill'
        } = params

        const [x, y] = position

        this.ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
        this.ctx.textAlign = align
        this.ctx.textBaseline = baseline
        if (this.yUp) {
            // 保存当前上下文状态
            this.ctx.save()

            // 反转Y轴绘制文字后恢复上下文状态，保证文字不被翻转
            this.ctx.scale(1, -1)
            this.ctx.fillText(text, x, -y)
            this.ctx.restore()
        } else {
            if (type === 'fill' || type === 'both') {
                this.ctx.fillStyle = color
                this.ctx.fillText(text, x, y)
            }
            if (type === 'stroke' || type === 'both') {
                this.ctx.strokeStyle = strokeColor
                this.ctx.strokeText(text, x, y)
            }
        }
    }

    /**
     * 绘制贝塞尔曲线（支持二次/三次）
     * @param {Object} params - 参数对象
     * @param {Array<number>} [params.start=[50, 100]] - 起始点 [x, y]
     * @param {Array<Array<number>>} [params.controls=[[100, 50], [150, 150]]] - 控制点数组，2个点为三次贝塞尔曲线，1个点为二次贝塞尔曲线
     * @param {Array<number>} [params.end=[200, 100]] - 结束点 [x, y]
     * @param {string} [params.color='blue'] - 线条颜色
     * @param {number} [params.line=2] - 线条宽度
     * @param {Array<number>} [params.dash=[]] - 虚线模式，空数组表示实线
     */
    bezier(params = {}) {
        const {
            start = [50, 100],
            controls = [[100, 50], [150, 150]],
            end = [200, 100],
            color = 'blue',
            line = 2,
            dash = []
        } = params

        const [sx, sy] = start
        const [ex, ey] = end

        this.ctx.beginPath()
        this.ctx.moveTo(sx, sy)

        if (dash.length > 0) {
            this.ctx.setLineDash(dash)
        }

        if (controls.length === 1) {
            // 二次贝塞尔曲线
            const [cx, cy] = controls[0]
            this.ctx.quadraticCurveTo(cx, cy, ex, ey)
        } else if (controls.length >= 2) {
            // 三次贝塞尔曲线
            const [cx1, cy1] = controls[0]
            const [cx2, cy2] = controls[1]
            this.ctx.bezierCurveTo(cx1, cy1, cx2, cy2, ex, ey)
        }

        this.ctx.strokeStyle = color
        this.ctx.lineWidth = line
        this.ctx.stroke()
        this.resetLineDash() // 恢复为实线
    }
    /**
     * 绘制图像（支持旋转、缩放、锚点对齐）
     * @param {Object} params - 参数对象
     * @param {string} params.src - 图像地址（URL/Base64）
     * @param {Array<number>} params.position - 中心坐标 [x, y]
     * @param {Array<number>} [params.size] - 可选尺寸 [width, height]
     * @param {number} [params.rotation=0] - 旋转角度（弧度）
     * @param {Array<number>} [params.anchor=[0.5,0.5]] - 锚点比例 [0~1]
     */
    image(params = {}) {
        const {
            src,
            position = [0, 0],
            size = null,
            opacity = 1,
            rotation = 0,
            anchor = [0.5, 0.5],
            onClick = null
        } = params
        if (!src) return
        const img = new Image()
        img.src = src
        const [x, y] = position
        const [anchorX, anchorY] = anchor
        img.onload = () => {
            const drawWidth = size ? size[0] : img.width
            const drawHeight = size ? size[1] : img.height
            this.ctx.save()
            this.ctx.translate(x, y)
            if (rotation !== 0) {
                this.ctx.rotate(rotation)
            }
            // 计算锚点偏移
            const offsetX = -drawWidth * anchorX
            const offsetY = -drawHeight * anchorY
            this.ctx.globalAlpha = opacity; 
            this.ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
            this.ctx.globalAlpha = 1; 
            this.ctx.restore()

            if (typeof onClick === 'function') {
                this.shapes.push({
                    type: 'image',
                    x, y,
                    width: drawWidth,
                    height: drawHeight,
                    rotation,
                    anchorX, anchorY,
                    onClick: onClick
                })
            }
        }
        img.onerror = (e) => {
            console.error('Image load failed:', src, e)
        }
    }
    /**
     * 处理画布点击事件
     * @param {MouseEvent} event - 鼠标事件
     */
    handleClick(event) {
        // 获取点击坐标（考虑设备像素比）
        const rect = this.canvas.getBoundingClientRect()
        const x = (event.clientX - rect.left) / (rect.width / this.canvas.width) / this.dpr
        const y = (event.clientY - rect.top) / (rect.height / this.canvas.height) / this.dpr

        // 考虑Y轴是否翻转
        const clickY = this.yUp ? this.canvas.height / this.dpr - y : y
        // 从后向前检查形状（后绘制的在上层）
        for (let i = this.shapes.length - 1; i >= 0; i--) {
            const shape = this.shapes[i]
            let isHit = false
            switch (shape.type) {
                case 'rect':
                    isHit = this.isPointInRect(x, clickY, shape)
                    break
                case 'arc':
                    isHit = this.isPointInArc(x, clickY, shape)
                    break
                case 'triangle':
                    isHit = this.isPointInTriangle(x, clickY, shape)
                    break
                case 'image':
                    isHit = this.isPointInImage(x, clickY, shape)
                    break
            }

            if (isHit) {
                shape.onClick()
                break
            }
        }
    }
    /**
     * 判断点是否在矩形内
     * @param {number} x - 点x坐标
     * @param {number} y - 点y坐标
     * @param {Object} rect - 矩形形状对象
     * @returns {boolean}
     */
    isPointInRect(x, y, rect) {
        return x >= rect.x &&
            x <= rect.x + rect.width &&
            y >= rect.y &&
            y <= rect.y + rect.height
    }
    /**
     * 判断点是否在图片内（考虑旋转和锚点）
     * @param {number} x - 点x坐标
     * @param {number} y - 点y坐标
     * @param {Object} image - 图片形状对象
     * @returns {boolean}
     */
    isPointInImage(x, y, image) {
        // 考虑锚点偏移
        const offsetX = image.width * image.anchorX
        const offsetY = image.height * image.anchorY

        // 将点击坐标转换到图片局部坐标系（考虑旋转）
        const localX = x - image.x
        const localY = y - image.y

        // 如果有旋转，需要反向旋转点击坐标
        if (image.rotation !== 0) {
            const cos = Math.cos(-image.rotation)
            const sin = Math.sin(-image.rotation)
            const rotatedX = localX * cos - localY * sin
            const rotatedY = localX * sin + localY * cos
            return rotatedX >= -offsetX &&
                rotatedX <= (image.width - offsetX) &&
                rotatedY >= -offsetY &&
                rotatedY <= (image.height - offsetY)
        }

        // 无旋转的简单矩形检测
        return x >= (image.x - offsetX) &&
            x <= (image.x - offsetX + image.width) &&
            y >= (image.y - offsetY) &&
            y <= (image.y - offsetY + image.height)
    }
    /**
     * 判断点是否在圆形/扇形内
     * @param {number} x - 点x坐标
     * @param {number} y - 点y坐标
     * @param {Object} arc - 圆形形状对象
     * @returns {boolean}
     */
    isPointInArc(x, y, arc) {
        const dx = x - arc.x
        const dy = y - arc.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance > arc.radius) {
            return false
        }

        // 如果是完整圆形，直接返回
        if (arc.startAngle === 0 && arc.endAngle === Math.PI * 2) {
            return true
        }

        // 检查角度是否在扇形范围内
        let angle = Math.atan2(dy, dx)
        if (angle < 0) angle += Math.PI * 2

        if (arc.startAngle < arc.endAngle) {
            return angle >= arc.startAngle && angle <= arc.endAngle
        } else {
            return angle >= arc.startAngle || angle <= arc.endAngle
        }
    }

    /**
     * 判断点是否在三角形内
     * @param {number} x - 点x坐标
     * @param {number} y - 点y坐标
     * @param {Object} triangle - 三角形形状对象
     * @returns {boolean}
     */
    isPointInTriangle(x, y, triangle) {
        const [a, b, c] = triangle.points

        // 计算向量
        const v0 = [c[0] - a[0], c[1] - a[1]]
        const v1 = [b[0] - a[0], b[1] - a[1]]
        const v2 = [x - a[0], y - a[1]]

        // 计算点积
        const dot00 = v0[0] * v0[0] + v0[1] * v0[1]
        const dot01 = v0[0] * v1[0] + v0[1] * v1[1]
        const dot02 = v0[0] * v2[0] + v0[1] * v2[1]
        const dot11 = v1[0] * v1[0] + v1[1] * v1[1]
        const dot12 = v1[0] * v2[0] + v1[1] * v2[1]

        // 计算重心坐标
        const invDenominator = 1 / (dot00 * dot11 - dot01 * dot01)
        const u = (dot11 * dot02 - dot01 * dot12) * invDenominator
        const v = (dot00 * dot12 - dot01 * dot02) * invDenominator

        // 检查点是否在三角形内
        return (u >= 0) && (v >= 0) && (u + v <= 1)
    }

    /**
     * 清除所有形状记录（通常在重新渲染前调用）
     */
    clearShapes() {
        this.shapes = []
    }
    setDarwLineWidth(lineWidth) {
        this.darw_options.lineWidth = lineWidth
    }
    setDarwColor(color) {
        this.darw_options.color = color
    }
    /**
     * 启用绘图模式，接受参数：线条宽度和颜色
     * @param {Object} options - 配置项
     * @param {number} [options.lineWidth=2] - 线条宽度
     * @param {string} [options.color='black'] - 线条颜色
     */
    drawingBoard(options = {}) {
        const { lineWidth = 2, color = 'black' } = options;
        if (lineWidth) this.setDarwLineWidth(lineWidth)
        if (color) this.setDarwColor(color)
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;

        const startDraw = (e) => {
            isDrawing = true;
            // 获取点击坐标
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / this.dpr;
            const y = (e.clientY - rect.top) / this.dpr;
            [lastX, lastY] = [x, y];
        };

        const draw = (e) => {
            if (!isDrawing) return;

            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / this.dpr;
            const y = (e.clientY - rect.top) / this.dpr;

            this.ctx.beginPath();
            this.ctx.moveTo(lastX, lastY);
            this.ctx.lineTo(x, y);
            this.ctx.strokeStyle = this.darw_options.color;
            this.ctx.lineWidth = this.darw_options.lineWidth;
            this.ctx.lineCap = 'round'; // 让线条更圆滑
            this.ctx.stroke();

            [lastX, lastY] = [x, y];
        };

        const stopDraw = () => {
            isDrawing = false;
            this.ctx.closePath();
        };

        // 添加事件监听器
        this.canvas.addEventListener('mousedown', startDraw);
        this.canvas.addEventListener('mousemove', draw);
        this.canvas.addEventListener('mouseup', stopDraw);
        this.canvas.addEventListener('mouseout', stopDraw); // 鼠标移出画布时也停止

        // 返回方法用于取消监听（可选）
        return () => {
            this.canvas.removeEventListener('mousedown', startDraw);
            this.canvas.removeEventListener('mousemove', draw);
            this.canvas.removeEventListener('mouseup', stopDraw);
            this.canvas.removeEventListener('mouseout', stopDraw);
        };
    }
    /**
     * 在Canvas上绘制沿圆弧排列的文字（电子印章效果）
     * @param {Object} arcParams - 圆弧参数对象
     *        {Array} arcParams.center - 圆心坐标 [x, y]
     *        {number} arcParams.radius - 半径
     *        {number} arcParams.startAngle - 起始角度(弧度)
     *        {number} arcParams.endAngle - 结束角度(弧度)
     * @param {string} text - 要绘制的文字
     * @param {Object} [options] - 可选参数
     *        {string} [options.font] - 字体样式，默认 '16px Arial'
     *        {string} [options.color] - 文字颜色，默认 '#000'
     *        {boolean} [options.inside] - 文字在圆弧内侧，默认 false(外侧)
     *        {number} [options.charRotation] - 额外字符旋转角度(弧度)，默认 0
     *        {boolean} [options.clockwise] - 文字顺逆时针排列，默认 true(顺时针)
     */
    drawTextAlongArc(arcParams, text, options = {}) {
        // 设置默认选项
        const {
            font = '16px Arial',
            fontWeight = 'normal',
            color = 'red',
            inside = false,
            charRotation = 0,
            clockwise = true // 新增参数，默认顺时针
        } = options;

        // 保存当前上下文状态
        this.ctx.save();

        // 设置字体和颜色
        this.ctx.font = `${fontWeight} ${font}`;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // 解构圆弧参数
        const [centerX, centerY] = arcParams.center;
        const radius = arcParams.radius;
        let startAngle = arcParams.startAngle;
        let endAngle = arcParams.endAngle;

        // 根据顺时针/逆时针决定角度处理方式
        if (clockwise) {
            // 顺时针：确保endAngle > startAngle
            if (endAngle < startAngle) {
                [startAngle, endAngle] = [endAngle, startAngle];
            }
        } else {
            // 逆时针：确保startAngle > endAngle
            if (endAngle > startAngle) {
                [startAngle, endAngle] = [endAngle, startAngle];
            }
        }

        // 计算总弧度（取绝对值）
        const totalAngle = Math.abs(endAngle - startAngle);

        // 测量文本总宽度
        const textWidth = this.ctx.measureText(text).width;

        // 计算每个字符占用的角度
        const anglePerChar = totalAngle / text.length;

        // 计算基于半径的字符间距调整因子
        // 确保文字不会超出圆弧范围
        const spacingFactor = Math.min(1, (radius * totalAngle) / textWidth);
        const adjustedAnglePerChar = anglePerChar * spacingFactor * (clockwise ? 1 : -1);

        // 调整起始角度，使文字居中
        const totalTextAngle = adjustedAnglePerChar * (text.length - 1);
        const angleOffset = (totalAngle - Math.abs(totalTextAngle)) / 2 * (clockwise ? 1 : -1);
        startAngle += angleOffset;

        // 绘制每个字符
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const angle = startAngle + i * adjustedAnglePerChar;

            // 计算字符位置
            const charRadius = radius + (inside ? -15 : 15); // 稍微偏移使文字更清晰
            const x = centerX + Math.cos(angle) * charRadius;
            const y = centerY + Math.sin(angle) * charRadius;

            // 计算旋转角度（始终朝向圆心）
            let rotationAngle = angle + Math.PI / 2 + charRotation;
            if (inside) {
                rotationAngle += Math.PI; // 内侧文字翻转180度
            }

            // 保存当前状态
            this.ctx.save();

            // 移动到字符位置并旋转
            this.ctx.translate(x, y);
            this.ctx.rotate(rotationAngle);

            // 绘制字符
            this.ctx.fillText(char, 0, 0);

            // 恢复状态
            this.ctx.restore();
        }

        // 恢复上下文状态
        this.ctx.restore();
    }
    drawGrid() {
        this.ctx.save();
        for (let x = 0; x <= this.width; x += 20) {
            this.line({
                a: [x, 0],
                b: [x, this.height],
                color: 'ccc',
                line: 0.5,
            });
        }
        for (let y = 0; y <= this.height; y += 20) {
            this.line({
                a: [0, y],
                b: [this.width, y],
                color: 'ccc',
                line: 0.5,
            });
        }
        this.ctx.restore();
    }
    /**
     * 绘制五角星
     * @param {number} x - 中心点X坐标
     * @param {number} y - 中心点Y坐标
     * @param {string} color - 星星颜色
     * @param {number} size - 星星大小（外接圆半径）
     */
    drawStar(x, y, color, size) {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.beginPath();

        // 内外半径比例（标准的五角星比例）
        const outerRadius = size;
        const innerRadius = size * 0.382; // 黄金分割比例

        for (let i = 0; i < 10; i++) {
            const angle = Math.PI / 5 * i - Math.PI / 2;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const px = x + radius * Math.cos(angle);
            const py = y + radius * Math.sin(angle);

            if (i === 0) {
                this.ctx.moveTo(px, py);
            } else {
                this.ctx.lineTo(px, py);
            }
        }

        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
    }
    toDataURL(mimeType, quality) {
        return this.canvas.toDataURL(mimeType, quality);
    }

    toBlob(callback, mimeType, quality) {
        return this.canvas.toBlob(callback, mimeType, quality);
    }
    /**
     * 保存当前 canvas 内容为图片并触发下载
     * @param {Object} options - 配置项
     * @param {string} [options.type='png'] - 类型：'png' 或 'jpeg'
     * @param {number} [options.quality=0.9] - JPEG 质量（0~1）
     * @param {string} [options.filename] - 下载的文件名
     */
    save(options = {}) {
        const {
            type = 'png',
            quality = 0.9,
            filename = `canvas-${Date.now()}.${type === 'png' ? 'png' : 'jpg'}`
        } = options;

        // 获取数据 URL
        const mimeType = type === 'png' ? 'image/png' : 'image/jpeg';
        const dataURL = this.canvas.toDataURL(mimeType, quality);

        // 创建 a 标签模拟下载
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    render() {
        try {
            this.clear()
            this.clearShapes()
            this._draw()
        } catch (e) {
            throw new Error("Error in render function", e);
        }
    }
}
window.Canvas = Canvas;
export default Canvas;