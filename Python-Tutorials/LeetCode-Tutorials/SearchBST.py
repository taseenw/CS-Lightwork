#LeetCode #700 Tutorial - Search in a Binary Search Tree
#Author: Taseen Waseq

class Solution(object):
    def searchBST(self, root, val):
        stack=[root]
        print(stack)
        while stack:
            currentNode = stack.pop()
            if not currentNode:
                return None
            if currentNode.val == val:
                return currentNode
            if currentNode.val > val:
                stack.append(currentNode.left)
            elif currentNode.val < val:
                stack.append(currentNode.right)