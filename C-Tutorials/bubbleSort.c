//Bubble Sort Algorithm - C
//Author: Taseen Waseq

#include <stdio.h>

void bubbleSort(int array[], int arrSize) {

//int arrSize = sizeof(array) / sizeof(array[0]);
  int temp;

  for(int x = 0; x < arrSize; x++) {
    for(int i = 0; i < arrSize - 1; i++){
      if(array[i] > array[i + 1]) {
        temp = array[i];
        array [i] = array[i + 1];
        array [i + 1] = temp;
      }
    }
  }

}

int main() {
  int numbers[] = {5,64,32,2,3,1};
  
  int arrSize = sizeof(numbers) / sizeof(numbers[0]);

  printf("Before Sort:\n");
  
  for (int i = 0; i < arrSize; ++i) {
    printf("%d  ", numbers[i]);
  }

  bubbleSort(numbers, arrSize);
  
  printf("\nAfter Sort:\n");
  
  for (int i = 0; i < arrSize; ++i) {
    printf("%d  ", numbers[i]);
  }
}
