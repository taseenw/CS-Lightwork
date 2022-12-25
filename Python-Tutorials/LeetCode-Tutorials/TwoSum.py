class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        pairs={}

        for i,n in enumerate(nums):
            currentDiff = target - n
            if currentDiff in pairs:
                return [pairs[currentDiff], i]
            pairs[n] = i
        return
