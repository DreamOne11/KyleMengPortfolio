import React, { useRef, useEffect, useState, useCallback } from 'react';
// @ts-ignore
import ForceGraph2D from 'react-force-graph-2d';

// 节点类型
type NodeType = 'category' | 'skill';

interface SkillNode {
  id: string;
  name: string;
  type: NodeType;
  category: string;
  val: number;
  color: string;
}

interface SkillLink {
  source: string;
  target: string;
}

interface GraphData {
  nodes: SkillNode[];
  links: SkillLink[];
}

// 技能数据配置 - 统一深灰色
const skillsConfig = {
  'Programming Languages': {
    color: '#4B5563', // 深灰色
    skills: ['Python', 'Java', 'SQL', 'JavaScript', 'TypeScript']
  },
  'Frameworks & Technologies': {
    color: '#4B5563', // 深灰色
    skills: ['React', 'Next.js', 'LangGraph', 'RESTAPI', 'Spring Boot']
  },
  'Databases': {
    color: '#4B5563', // 深灰色
    skills: ['MySQL', 'PostgreSQL', 'HBase', 'Supabase', 'Vector Databases']
  },
  'Data Engineering': {
    color: '#4B5563', // 深灰色
    skills: ['ETL/ELT', 'Data Pipelines', 'Data Modeling', 'Hadoop', 'Airflow', 'Snowflake', 'dbt']
  }
};

// 转换技能数据为图形数据
const transformSkillsData = (): GraphData => {
  const nodes: SkillNode[] = [];
  const links: SkillLink[] = [];

  // 创建类别节点和技能节点 - 所有节点大小统一
  Object.entries(skillsConfig).forEach(([categoryName, config]) => {
    // 类别节点 - 与技能节点大小相同
    const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-');
    nodes.push({
      id: categoryId,
      name: categoryName,
      type: 'category',
      category: categoryName,
      val: 4, // 节点半径
      color: config.color
    });

    // 技能节点 - 与类别节点大小相同
    config.skills.forEach(skillName => {
      const skillId = `${categoryId}-${skillName.toLowerCase().replace(/\s+/g, '-')}`;
      nodes.push({
        id: skillId,
        name: skillName,
        type: 'skill',
        category: categoryName,
        val: 4, // 节点半径
        color: config.color
      });

      // 连接技能到类别
      links.push({
        source: skillId,
        target: categoryId
      });
    });
  });

  return { nodes, links };
};

const SkillsGraph: React.FC = () => {
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [graphData] = useState<GraphData>(() => {
    const data = transformSkillsData();
    console.log('SkillsGraph data loaded:', {
      nodes: data.nodes.length,
      links: data.links.length
    });
    return data;
  });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());
  const [highlightLinks, setHighlightLinks] = useState<Set<string>>(new Set());
  const [dimensions, setDimensions] = useState({ width: 1000, height: 800 });

  // 计算容器尺寸
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        const newWidth = width || 1000;
        const newHeight = height || 800;
        console.log('SkillsGraph dimensions:', { width: newWidth, height: newHeight });
        setDimensions({ width: newWidth, height: newHeight });
      }
    };

    // 延迟测量以确保容器已渲染
    const timer = setTimeout(updateDimensions, 100);

    window.addEventListener('resize', updateDimensions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // 配置 D3 力模拟
  useEffect(() => {
    if (graphRef.current) {
      const fg = graphRef.current;

      // 等待图形初始化完成后再配置
      const timer = setTimeout(() => {
        try {
          // 配置力导向参数 - 类似 Obsidian 的布局
          const chargeForce = fg.d3Force('charge');
          if (chargeForce) {
            chargeForce.strength(-15); // 适度排斥力，防止节点聚集
          }

          const linkForce = fg.d3Force('link');
          if (linkForce) {
            linkForce.distance(80); // 紧凑的边长度
            linkForce.strength(0.8); // 增强连接力
          }

          const centerForce = fg.d3Force('center');
          if (centerForce) {
            centerForce.strength(0.1); // 强中心引力，保持节点集中
          }

          // 添加碰撞检测 - 防止节点重叠
          const collisionRadius = 10;
          const collisionForce = (alpha: number) => {
            graphData.nodes.forEach((node: any, i: number) => {
              graphData.nodes.slice(i + 1).forEach((otherNode: any) => {
                if (!node.x || !node.y || !otherNode.x || !otherNode.y) return;

                const dx = otherNode.x - node.x;
                const dy = otherNode.y - node.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = collisionRadius * 2;

                if (distance < minDistance && distance > 0) {
                  const strength = (minDistance - distance) / distance * alpha * 0.7;
                  const moveX = dx * strength;
                  const moveY = dy * strength;

                  node.vx = (node.vx || 0) - moveX;
                  node.vy = (node.vy || 0) - moveY;
                  otherNode.vx = (otherNode.vx || 0) + moveX;
                  otherNode.vy = (otherNode.vy || 0) + moveY;
                }
              });
            });
          };
          fg.d3Force('collision', collisionForce);

          // 添加画布边界约束力 - 保持节点在可视区域内
          const boundaryForce = () => {
            // 限制在可视区域内，给予足够空间
            const maxWidth = dimensions.width * 0.3; // 使用40%的宽度
            const maxHeight = dimensions.height * 0.3; // 使用40%的高度
            const strength = 0.2; // 适度约束力

            graphData.nodes.forEach((node: any) => {
              if (!node.x || !node.y) return;

              // X 方向边界检查
              if (node.x > maxWidth) {
                node.vx = node.vx || 0;
                node.vx -= (node.x - maxWidth) * strength;
              } else if (node.x < -maxWidth) {
                node.vx = node.vx || 0;
                node.vx -= (node.x - (-maxWidth)) * strength;
              }

              // Y 方向边界检查
              if (node.y > maxHeight) {
                node.vy = node.vy || 0;
                node.vy -= (node.y - maxHeight) * strength;
              } else if (node.y < -maxHeight) {
                node.vy = node.vy || 0;
                node.vy -= (node.y - (-maxHeight)) * strength;
              }
            });
          };

          fg.d3Force('boundary', boundaryForce);
        } catch (e) {
          console.warn('Force graph configuration:', e);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [graphData.nodes, dimensions.width, dimensions.height]);

  // 处理节点悬停和高亮
  const updateNodeHighlight = useCallback((node: SkillNode | null) => {
    if (!node) {
      // 结束hover：恢复默认状态
      setHoveredNode(null);
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
      return;
    }

    // 开始hover：显示紫色高亮
    setHoveredNode(node.id);

    // 找出相关节点和边
    const neighbors = new Set<string>();
    const links = new Set<string>();

    neighbors.add(node.id);

    graphData.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
      const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target;

      if (sourceId === node.id || targetId === node.id) {
        neighbors.add(sourceId);
        neighbors.add(targetId);
        links.add(`${sourceId}-${targetId}`);
      }
    });

    setHighlightNodes(neighbors);
    setHighlightLinks(links);
  }, [graphData.links]);

  // 处理节点悬停
  const handleNodeHover = useCallback((node: SkillNode | null) => {
    updateNodeHighlight(node);
  }, [updateNodeHighlight]);

  // 处理背景点击 - 清除所有高亮
  const handleBackgroundClick = useCallback(() => {
    setHoveredNode(null);
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
  }, []);

  // 处理节点拖拽（与hover逻辑相同）
  const handleNodeDrag = useCallback((node: SkillNode | null) => {
    updateNodeHighlight(node);
  }, [updateNodeHighlight]);


  // 节点渲染函数 - Obsidian 风格，支持缩放级别
  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const nodeData = node as SkillNode;

    // 检查节点坐标是否有效
    if (!isFinite(node.x) || !isFinite(node.y)) {
      return; // 跳过无效节点
    }

    const isHighlighted = highlightNodes.size === 0 || highlightNodes.has(nodeData.id);
    const isHovered = hoveredNode === nodeData.id;
    const isConnected = isHighlighted && !isHovered && highlightNodes.size > 0;
    const opacity = isHighlighted ? 1 : 0.25;

    // 节点大小（hover 时稍微放大）
    const sizeMultiplier = isHovered ? 1.15 : 1;
    const radius = nodeData.val * sizeMultiplier;

    // 确保 radius 是有效数值
    if (!isFinite(radius) || radius <= 0) {
      return; // 跳过无效半径
    }

    // 绘制 hover 状态的光晕
    if (isHovered) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 3, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(137, 108, 230, 0.15)';
      ctx.fill();
    }

    // 绘制节点 - 纯色填充（类似 Obsidian）
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);

    // 根据状态选择颜色：hover 和 connected 都变为紫色
    let fillColor = '#4B5563'; // 默认深灰色
    if (isHovered || isConnected) {
      fillColor = '#896CE6'; // hover节点和关联节点都用紫色
    }

    const fillOpacity = Math.round(opacity * 230).toString(16).padStart(2, '0');
    ctx.fillStyle = fillColor + fillOpacity;
    ctx.fill();

    // 根据缩放级别决定是否显示标签
    // globalScale > 2: 正常显示
    // 1 < globalScale <= 2: 字体变小、颜色变浅
    // globalScale <= 1: 完全隐藏，只在hover时显示
    const label = nodeData.name;
    let shouldShowLabel = false;
    let fontSize = 11;
    let labelOpacity = opacity * 0.85;

    if (globalScale > 2) {
      // 正常显示标签
      shouldShowLabel = true;
      fontSize = 11;
      labelOpacity = opacity * 0.85;
    } else if (globalScale > 1) {
      // 缩放中：字体变小、颜色变浅
      shouldShowLabel = true;
      fontSize = 9 + (globalScale - 1) * 2; // 9-11px
      labelOpacity = opacity * 0.4 * globalScale; // 逐渐变浅
    } else {
      // 缩放到很小：只在hover时显示
      shouldShowLabel = isHovered;
      fontSize = 11;
      labelOpacity = opacity * 0.85;
    }

    if (shouldShowLabel) {
      const fontWeight = '400';
      ctx.font = `${fontWeight} ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const labelY = node.y + radius + fontSize + 4;

      if (!isFinite(labelY)) {
        return;
      }

      const textWidth = ctx.measureText(label).width;

      if (isFinite(textWidth) && textWidth > 0) {
        // 标签文字 - 黑色，无背景
        ctx.fillStyle = `rgba(0, 0, 0, ${labelOpacity})`;
        ctx.fillText(label, node.x, labelY);
      }
    }
  }, [highlightNodes, hoveredNode]);

  // 边渲染函数 - Obsidian 风格，统一浅黑色
  const paintLink = useCallback((link: any, ctx: CanvasRenderingContext2D) => {
    // 检查连接的节点坐标是否有效
    if (!link.source || !link.target ||
        !isFinite(link.source.x) || !isFinite(link.source.y) ||
        !isFinite(link.target.x) || !isFinite(link.target.y)) {
      return; // 跳过无效的边
    }

    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    const linkId = `${sourceId}-${targetId}`;

    const isHighlighted = highlightLinks.size === 0 || highlightLinks.has(linkId);
    const opacity = isHighlighted ? 0.5 : 0.2;
    const width = isHighlighted ? 1 : 0.7; // 边线更细

    // 统一使用浅黑色
    const edgeColor = '#9CA3AF';

    ctx.strokeStyle = `${edgeColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(link.source.x, link.source.y);
    ctx.lineTo(link.target.x, link.target.y);
    ctx.stroke();
  }, [highlightLinks]);

  return (
    <div ref={containerRef} className="w-full h-full relative min-h-[400px]">
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        nodeRelSize={1}
        nodeVal={(node: any) => (node as SkillNode).val}
        nodeCanvasObject={paintNode}
        linkCanvasObject={paintLink}
        onNodeHover={handleNodeHover}
        onNodeDrag={handleNodeDrag}
        onBackgroundClick={handleBackgroundClick}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        enableNodeDrag={true}
        nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
          // 增大节点可点击区域
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 10, 0, 2 * Math.PI); // 适配缩小的节点
          ctx.fill();
        }}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        cooldownTime={3000}
        warmupTicks={80}
        backgroundColor="rgba(0,0,0,0)"
      />
    </div>
  );
};

export default SkillsGraph;
