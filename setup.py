import os
from setuptools import find_packages, setup

with open(os.path.join(os.path.dirname(__file__), 'README.rst')) as readme:
    README_RST = readme.read()

# allow setup.py to be run from any path
os.chdir(os.path.normpath(os.path.join(os.path.abspath(__file__), os.pardir)))

setup(
    name='django-sort-order-field',
    version='0.1',
    packages=find_packages(),
    include_package_data=True,
    license='BSD License',
    description='A Django model field for controlling sort order.',
    long_description=README_RST,
    long_description_content_type='text/x-rst',
    url='https://github.com/dylanmccall/django-sort-order-field',
    author='Dylan McCall',
    author_email='dylan@dylanmccall.com',
    classifiers=[
        'Environment :: Web Environment',
        'Framework :: Django',
        'Framework :: Django :: 1.11',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: BSD License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6',
        'Topic :: Internet :: WWW/HTTP',
        'Topic :: Internet :: WWW/HTTP :: Dynamic Content',
    ],
    keywords='django sort field',
)
