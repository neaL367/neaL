import React from 'react';

interface TreeNode {
  name: string;
  children?: TreeNode[];
}

interface DirectoryTreeProps {
  tree: TreeNode;
}

const DirectoryTree: React.FC<DirectoryTreeProps> = ({ tree }) => {
  const renderTree = (node: TreeNode, depth: number = 0, isLast: boolean = true): React.ReactNode => {
    const indent = '    '.repeat(depth);
    const prefix = depth === 0 ? '' : isLast ? '└── ' : '├── ';

    return (
      <React.Fragment key={node.name}>
        <div className="whitespace-pre font-mono text-sm">
          {indent}{prefix}{node.name}
        </div>
        {node.children?.map((child, index, array) => 
          renderTree(child, depth + 1, index === array.length - 1)
        )}
      </React.Fragment>
    );
  };

  return (
    <pre className="p-4 mb-4 text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-x-auto">
      {renderTree(tree)}
    </pre>
  );
};

export default DirectoryTree;

