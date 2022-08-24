#Selenium Basics - Python
#Author: Taseen Waseq

from selenium import webdriver
from selenium.webdriver.common.by import By
import time

path = "C:\\Users\\tasee\\Desktop\\chromedriver.exe"
instaURL="https://www.instagram.com/"
username = "YOUR USERNAME"
password = "YOUR PASSWORD"

driver = webdriver.Chrome(executable_path = path)
driver.get(instaURL)

time.sleep(3)

usernameEntry = driver.find_element(By.XPATH, '//*[@id="loginForm"]/div/div[1]/div/label/input')
usernameEntry.send_keys(username)

passwordEntry = driver.find_element(By.XPATH, '//*[@id="loginForm"]/div/div[2]/div/label/input')
passwordEntry.send_keys(password)

loginButton = driver.find_element(By.XPATH, '//*[@id="loginForm"]/div/div[3]/button').click()
