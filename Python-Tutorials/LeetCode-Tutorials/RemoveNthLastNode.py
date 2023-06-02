#LeetCode #19 - Remove Nth Node From End of List
#Author: Taseen Waseq

class Solution(object):
    def removeNthFromEnd(self, head, n):
        tmp = left = ListNode(0, head)
        right = head

        if not head:
            return head
        
        x=0
        while x < n and right:
            right=right.next
            x+=1
        
        while right:
            left=left.next
            right=right.next

        left.next = left.next.next

        return tmp.next