#Binary Search Algorithm - Python
#Author: Taseen Waseq

def binarySearchRec(li, left, right, target):
    if left > right:
        return -1
    
    mid = (left + right) // 2

    if li[mid] == target:
        return mid
    elif li[mid] > target:
        return binarySearchRec(li, left, mid-1, target)
    else:
        return binarySearchRec(li, mid+1, right, target)

def binarySearchIt(li, target):
    
    if len(li) > 0:
        left = 0
        right = len(li) - 1

        while left <= right:
            mid = (left + right) // 2

            if li[mid] == target:
                return mid
            elif li[mid] > target:
                right = mid-1
            else:
                left = mid + 1
        
        return -1

li=[1,4,6,8,23,53,75]
target=69
left = 0
right = len(li) - 1

print(binarySearchIt(li, target)
print(binarySearchRec(li, left, right, target))
